import { RichApiLink } from './api-link';

interface DismissalOption {
  link: RichApiLink;
  text: string;
  destructive: boolean;
}

export interface Dismissal {
  options: DismissalOption[];
}
