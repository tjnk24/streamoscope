declare module '*.scss' {
    type CssModuleClasses = {readonly [key: string]: string};

    const classes: CssModuleClasses;
    export default classes;
}
