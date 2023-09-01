# Monads

From https://www.youtube.com/watch?v=C2w45qRc3aU

Monads are a design pattern that allows a dev to chain operations while the monad manages secret work behind the scenes.

Monads have:

- a wrapper type, like Promise<T> or NumberWithLogs
- a wrap function, accepting T and returning WrapperType<T>
- a run function, which runs transforms on the monadic value. Accept WrapperType<T> and transformFn T => WrapperType<T>, and returns WrapperType<T>

The run function passes a WrapperType in and out of it, accepting a fn of raw value. It will unwrap the WrapperType to perform work, and also transform the unwrapped raw value, and then re-wrap the result.
