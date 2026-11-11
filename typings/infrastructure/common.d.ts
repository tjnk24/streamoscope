export type Nullable<Value> = Value | null;

export type DeepPartial<Source> = {
    [Key in keyof Source]?: Source[Key] extends object ? DeepPartial<Source[Key]> : Source[Key];
};
