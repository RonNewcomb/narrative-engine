import { assert } from "chai";
import { describe, it } from "mocha";
import { Constant, Fact, Functor, Goal, Rule, Space, Substitution, Term, Variable } from "./assets/prolog.ts";

describe("terms can be stringified correctly", () => {
  it("case 1", () => {
    const f = new Constant("f");
    const g = new Constant("g");
    const c = new Constant("c");
    const X = new Variable("X");
    const Y = new Variable("Y");

    const term = new Functor(f, new Functor(g, X, Y), new Functor(f, X), c);

    assert.strictEqual(term.toString(), "(f, (g, X, Y), (f, X), c)");
  });
});

describe("substitutions can be applied correctly", () => {
  it("case 1", () => {
    const X = new Variable("X");
    const Y = new Variable("Y");
    const f = new Constant("f");
    const c = new Constant("c");
    const d = new Constant("d");

    const term = new Functor(f, X, new Functor(f, X, Y));

    const substituted = Substitution.applyAll(term, [new Substitution(X, c), new Substitution(Y, d)]);

    assert.strictEqual(substituted.toString(), "(f, c, (f, c, d))");
  });
});

describe("can process queries correctly", () => {
  describe("case 1", () => {
    const z = new Constant("z");
    const add = new Constant("add"); // relationship name
    const s = new Constant("s");

    // add(z, Y, Y).
    const facts = [
      (() => {
        const Y = new Variable("Y");
        return new Fact(add, z, Y, Y);
      })(),
    ];

    // add(s(X), Y, s(Z)) :- add(X, Y, Z).
    const rules = [
      (() => {
        const X = new Variable("X");
        const Y = new Variable("Y");
        const Z = new Variable("Z");

        return new Rule(new Functor(add, new Functor(s, X), Y, new Functor(s, Z)), [new Functor(add, X, Y, Z)]);
      })(),
    ];

    const space = new Space(facts, rules);

    const X = new Variable("X");

    it("case 1-1", () => {
      // add(s(z), s(s(z)), X)
      const result = space.query(new Goal(add, new Functor(s, z), new Functor(s, new Functor(s, z)), X));

      // there should be one suitable substituion
      const { done, value } = result.next();
      assert.strictEqual(done, false);
      assert.strictEqual((value.get(X) as Term).toString(), "(s, (s, (s, z)))");
      assert.strictEqual(result.next().done, true);
    });

    it("case 1-2", () => {
      // add(X, s(z), s(s(z)))
      const result = space.query(new Goal(add, X, new Functor(s, z), new Functor(s, new Functor(s, z))));

      // there should be one suitable substituion
      const { done, value } = result.next();
      assert.strictEqual(done, false);
      assert.strictEqual((value.get(X) as Term).toString(), "(s, z)");
      assert.strictEqual(result.next().done, true);
    });
  });
});

describe("can solve mysteries", () => {
  it.skip("can solve mysteries", () => {
    const facts = `
man(dr_black).
man(reverend_green).
man(colonel_mustard).
man(professor_plum).
woman(mrs_peacock).
woman(madame_rose).
woman(miss_scarlett).
woman(mrs_white).
victim(dr_black).
playing_cards(colonel_mustard).
playing_cards(reverend_green).
playing_cards(mrs_peacock).
gardening(mrs_white).
gardening(reverend_green).
played_golf(professor_plum).
played_golf(colonel_mustard).
smoker(miss_scarlett).
smoker(colonel_mustard).
smoker(mrs_white).
smoker(dr_black).
smoker(mrs_peacock).
room(room_21).
room(room_22).
room(room_23).
room(room_24).
room(room_25).
stay_in(dr_black,room_22).
stay_in(reverend_green,room_24).
stay_in(miss_scarlett,room_21).
stay_in(colonel_mustard,room_24).
stay_in(professor_plum,room_22).
stay_in(mrs_peacock,room_23).
stay_in(madame_rose,room_21).
stay_in(mrs_white,room_23).
owns_revolver(reverend_green).
owns_revolver(colonel_mustard).
owns_revolver(madame_rose).`
      .split(".")
      .filter(x => !!x.trim())
      .map(factString => {
        const name = factString.split("(")[0];
        const args = factString.split("(")[1].split(")")[0].split(",");
        return new Fact(...[new Constant(name)].concat(args.map(arg => new Constant(arg))));
      });

    const howto = `
not(X) :- X, !, fail.
not(_).
different(X,Y):- X \= Y.`;

    const rules = `
suspect(X):- man(X), not(victim(X)).
suspect(X):- woman(X), not(victim(X)).
has_alibi(X):- suspect(X), playing_cards(X).
went_outside(X):- gardening(X).
went_outside(X):- smoker(X).
went_outside(X):- played_golf(X).
share_room(X,Y):- room(R), stay_in(X,R), stay_in(Y,R), different(X,Y).
revolver_access(X):- owns_revolver(X).
revolver_access(X):- share_room(X,Y), owns_revolver(Y).
guilty(X):- suspect(X), went_outside(X), not(has_alibi(X)), revolver_access(X).        `
      .split(".")
      .filter(x => !!x.trim())
      .map(line => {
        const [head, body] = line.split(":-").map(x => x.trim());
        const headP = head.split("(");
        const name = headP[0];
        const args = headP[1].split(")")[0].split(",");
        const headFact = new Functor(new Constant(name), ...args.map(arg => new Variable(arg)));

        const bodyTerms = body.split(",").map(term => {
          const termP = term.trim().split("(");
          const termName = termP[0];
          const termArgs = termP[1].split(")")[0].split(",");
          return new Functor(new Constant(termName), ...termArgs.map(arg => new Variable(arg)));
        });

        return new Rule(headFact, bodyTerms);
      });

    const space = new Space(facts, rules);

    const X = new Variable("X");
    const guilty = new Constant("guilty");
    const goal = new Goal(guilty, X);

    const result = space.query(goal);

    const { done, value } = result.next();
    assert.strictEqual(done, false);
    assert.strictEqual((value.get(X) as Term).toString(), "(s, (s, (s, z)))");
    assert.strictEqual(result.next().done, true);
  });
});
