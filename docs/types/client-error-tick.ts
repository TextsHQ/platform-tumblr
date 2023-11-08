export default interface ClientErrorTick { // eslint-disable-line import/no-default-export
  route: string;
  name: string;
  message: string;
  stack: string;
  timestamp: number;
  isExtension: boolean;
  release: string;
}
