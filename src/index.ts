/**
 * Creates a tagged error class constructor
 * @param tag - The tag/type identifier for the error
 * @returns A constructor function for creating tagged errors
 */
export const TaggedError = <Tag extends string>(tag: Tag) => {
  return class TaggedErrorClass extends Error {
    readonly _tag = tag;

    constructor(args?: Record<string, any>) {
      super();

      this.name = tag;

      if (args) {
        Object.assign(this, args);
      }

      Object.setPrototypeOf(this, TaggedErrorClass.prototype);
    }
  } as {
    new (): Error & { readonly _tag: Tag };
    new <A extends Record<string, any>>(args: A): Error & {
      readonly _tag: Tag;
    } & Readonly<A>;
  };
};
