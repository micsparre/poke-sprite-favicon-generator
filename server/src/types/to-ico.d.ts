declare module 'to-ico' {
  function toIco(files: Buffer[]): Promise<Buffer>;
  export default toIco;
}
