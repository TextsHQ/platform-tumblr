enum SortableEventType { // eslint-disable-line no-restricted-syntax
  End = 'end',
  Start = 'start',
}

export interface SortableEvent {
  newIndex: number;
  oldIndex: number;
  newDraggableIndex: number;
  oldDraggableIndex: number;
  clone: HTMLElement;
  to: HTMLElement;
  from: HTMLElement;
  item: HTMLElement;
  originalEvent: DragEvent;
  path: HTMLElement[];
  srcElement: HTMLElement;
  target: HTMLElement;
  type: SortableEventType;
  related: HTMLElement;
}

export type SortableOptions = any; // TODO fill this in with the options eventually.
