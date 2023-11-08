import { BluespacePage, isPageDrafts, isPageQueue } from 'types/bluespace';

export enum PostSaveButtonState { // eslint-disable-line no-restricted-syntax
  New = 'new',
  Draft = 'draft',
  Queue = 'queue',
}

export default interface ComposeSettings { // eslint-disable-line import/no-default-export
  saveButtonState: PostSaveButtonState;
}

export function composeSettingsForActivePage(bluespacePage?: BluespacePage): ComposeSettings {
  if (isPageDrafts(bluespacePage)) {
    return { saveButtonState: PostSaveButtonState.Draft };
  }

  if (isPageQueue(bluespacePage)) {
    return { saveButtonState: PostSaveButtonState.Queue };
  }

  return { saveButtonState: PostSaveButtonState.New };
}
