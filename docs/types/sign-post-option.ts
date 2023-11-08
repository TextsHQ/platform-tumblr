export const SignpostOptionDisplayTypes = {
  Selected: 'selected',
  Discreet: 'discreet',
};

export const SignPostOnTapActions = {
  None: 'none',
  Dismiss: 'dismiss',
  Navigate: 'navigate',
  Link: 'link',
};

interface SignPostOnTapEvent {
  action: string;
  afterTapMessage?: string;
  eventDetails?: Record<string, any>;
  links: {
    action?: {
      method: string;
      href: string;
      bodyParams?: Record<string, string>;
    };
    destination?: {
      href: string;
      launchNewTab: boolean;
    };
  };
}

export type TSignpostOption = {
  text: string;
  displayType: string;
  iconKey: string;
  onTap: SignPostOnTapEvent;
};
