import { PostRole, PostSort, PostTypeForUI } from 'types/posts';

export interface FilterMenuState {
  postType?: PostTypeForUI;
  postRole: PostRole;
  postSort: PostSort;
}

export const defaultFilterQueryParams: FilterMenuState = {
  postType: undefined,
  postRole: 'any',
  postSort: PostSort.CreatedDesc,
};
