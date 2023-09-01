// define monad //////////////

interface NumberWithLogs {
  result: number;
  logs: string[];
}

function wrapWithLogs(x: number): NumberWithLogs {
  return { result: x, logs: [] };
}

function runWithLogs(input: NumberWithLogs, transform: (_: number) => NumberWithLogs): NumberWithLogs {
  const newNumWithLogs = transform(input.result);
  return { result: newNumWithLogs.result, logs: input.logs.concat(newNumWithLogs.logs) };
}

///// transforms with it ////////

function square(x: number): NumberWithLogs {
  return { result: x * x, logs: [`Squared ${x} to get ${x * x}.`] };
}

function addOne(x: number): NumberWithLogs {
  return { result: x + 1, logs: [`Added 1 to get ${x + 1}`] };
}

///  examples of use

const a = wrapWithLogs(5);
const b = runWithLogs(a, addOne);
const c = runWithLogs(b, square);
//const d = runWithLogs(c, multiplyByThree);

// in other languages, define  >>=  as taking a monad, then applying its matching run() to the value to return the new monad.
// so the wrap(raw) function would be called unit(raw), pure(raw), or return(raw)

const addOneM = (x: NumberWithLogs) => runWithLogs(x, addOne);
