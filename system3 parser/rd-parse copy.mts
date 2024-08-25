function locAt(text: string, newPos: number, { pos, line, column }) {
  while (pos < newPos) {
    const ch = text[pos++];
    if (ch === "\n") {
      column = 1;
      line++;
    } else column++;
  }
  return { pos, line, column };
}

const markSeen = ($: ParseState): void => {
  if ($.pos > $.lastSeen.pos) {
    Object.assign($.lastSeen, locAt($.text, $.pos, $.lastSeen));
  }
};

export const RegexToken =
  (pattern: RegExp) =>
  ($: ParseState): ParseState => {
    markSeen($);

    const match = pattern.exec($.text.substring($.pos));
    if (!match) return $;

    // Token is matched -> push all captures to the stack and return the match
    const $next: ParseState = {
      ...$,
      pos: $.pos + match[0].length,
    };

    for (let i = 1; i < match.length; i++) {
      $.stack[$next.sp++] = match[i];
    }

    return $next;
  };

export const StringToken =
  (pattern: string) =>
  ($: ParseState): ParseState => {
    markSeen($);

    if ($.text.startsWith(pattern, $.pos)) {
      return {
        ...$,
        pos: $.pos + pattern.length,
      };
    }
    return $;
  };

type Rule = StateAdvanceFn | RegExp | string;

export function Use(rule: Rule): StateAdvanceFn {
  if (typeof rule === "function") return rule;
  if (rule instanceof RegExp) return RegexToken(rule);
  if (typeof rule === "string") return StringToken(rule);
  throw new Error("Invalid rule");
}

export function Ignore(
  toIgnore: StateAdvanceFn | null,
  rule: Rule
): StateAdvanceFn {
  const stateAdvanceFn = Use(rule);
  if (toIgnore) toIgnore = Ignore(null, Plus(toIgnore));

  return ($: ParseState): ParseState => {
    const $cur = toIgnore ? toIgnore($) : $;

    $.ignore.push(toIgnore);
    const $next = stateAdvanceFn($cur);
    $.ignore.pop();

    return $next === $cur ? $ : toIgnore ? toIgnore($next) : $next;
  };
}

const skipIgnored = ($: ParseState): ParseState => {
  if (!$.ignore.length) return $;

  const toIgnore = $.ignore[$.ignore.length - 1];
  return toIgnore ? toIgnore($) : $;
};

// Match a sequence of rules left to right
export function All(...rules: Rule[]): StateAdvanceFn {
  const stateAdvanceFns = rules.map(Use);

  return ($: ParseState): ParseState => {
    let $cur = $;
    for (let i = 0; i < stateAdvanceFns.length; i++) {
      const $before = i > 0 ? skipIgnored($cur) : $cur;

      const $after = stateAdvanceFns[i]($before);
      if ($after === $before) return $; // if one rule fails: fail all

      if ($after.pos > $before.pos || $after.sp > $before.sp) {
        // Prevent adding whitespace if matched an optional rule last
        // Consequently All will fail if all the rules don't make any progress and don't put anything on stack
        $cur = $after;
      }
    }
    return $cur;
  };
}

// Match any of the rules with left-to-right preference
export function Any(...rules: Rule[]): StateAdvanceFn {
  const stateAdvanceFns = rules.map(Use);

  return ($: ParseState): ParseState => {
    for (let i = 0; i < stateAdvanceFns.length; i++) {
      const $next = stateAdvanceFns[i]($);
      if ($next !== $) return $next; // when one rule matches: return the match
    }
    return $;
  };
}

// Match a rule 1 or more times
export function Plus(rule: Rule): StateAdvanceFn {
  const stateAdvanceFn = Use(rule);

  return ($: ParseState): ParseState => {
    while (true) {
      const $cur = skipIgnored($);
      const $next = stateAdvanceFn($cur);
      if ($next === $cur) return $;
      $ = $next;
    }
  };
}

// Match a rule optionally
export function Optional(rule: Rule): StateAdvanceFn {
  const stateAdvanceFn = Use(rule);

  return ($: ParseState): ParseState => {
    const $next = stateAdvanceFn($);
    if ($next !== $) return $next;

    // Otherwise return a shallow copy of the state to still indicate a match
    return { ...$ };
  };
}

type NodeReturnValue = null | string | any;

type ReducerFn = (
  stack: string[],
  old: ParseState,
  next: ParseState
) => NodeReturnValue;

type StateAdvanceFn = (old: ParseState) => ParseState;

export function Node(rule: Rule, reducer: ReducerFn): StateAdvanceFn {
  const stateAdvanceFn = Use(rule);

  return ($: ParseState): ParseState => {
    const $next = stateAdvanceFn($);
    if ($next === $) return $;

    // We have a match
    const node = reducer($.stack.slice($.sp, $next.sp), $, $next);
    $next.sp = $.sp;
    if (node !== null) $.stack[$next.sp++] = node;

    return $next;
  };
}

export const Star = (rule: Rule) => Optional(Plus(rule));

// Y combinator: often useful to define recursive grammars
export const Y = proc => (x => proc(y => x(x)(y)))(x => proc(y => x(x)(y)));

export const START = (text: string, pos = 0) => ({
  text,
  ignore: [] as (StateAdvanceFn | null)[],
  stack: [] as NodeReturnValue[],
  sp: 0,
  lastSeen: locAt(text, pos, { pos: 0, line: 1, column: 1 }),
  pos,
});

type ParseState = ReturnType<typeof START>;

export function Parser(Grammar, pos = 0, partial = false) {
  return (text: string) => {
    if (typeof text !== "string") {
      throw new Error("Parsing function expects a string input");
    }

    const $ = START(text, pos);
    const $next = Grammar($);

    // No match or haven't consumed the whole input
    if (!partial && $.lastSeen.pos >= text.length) {
      throw new Error(`Unexpected end of input`);
    } else if ($ === $next || (!partial && $next.pos < text.length)) {
      throw new Error(
        `Unexpected token at ${$.lastSeen.line}:${
          $.lastSeen.column
        }. Remainder: ${text.slice($.lastSeen.pos)}`
      );
    }

    return $.stack[0];
  };
}
