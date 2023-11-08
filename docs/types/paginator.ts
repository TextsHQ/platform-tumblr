import { type CSSProperties, type ReactNode } from 'react';
import { type IApiRequest } from 'utils/api-helper/api-request';
import type ApiError from 'utils/errors/api';
import { type APILink } from './api-link';

export interface PaginatorContentState<T> {
  objects: T[];
  nextLink?: APILink;
  prevLink?: APILink;
}

export interface OnPaginationParams<T, U> {
  objects: T[];
  nextLink?: APILink;
  requestType: PaginatorRequestType;
  response: U;
}

export interface OnPaginationErrorParams {
  requestType: PaginatorRequestType;
  error: ApiError;
}

export enum PaginatorRequestType { // eslint-disable-line no-restricted-syntax
  Initial,
  Pagination,
  Refresh,
}

export enum PaginatorDirection { // eslint-disable-line no-restricted-syntax
  Bottom = 'bottom',
  Top = 'top',
  Right = 'right',
}

/**
 * We use this to set the value of an empty style to an empty string by default. This is to differentiate it from the
 * null value it would get otherwise if pulling an empty style attribute. This is useful for us to determine
 * when to de-cache the value later to remove the `overflow-y: hidden` property to confirm that we're on the other
 * side of setting the anti-scroll styling and don't just have a container with no style attributes.
 * [exported for testing]
 */
export const emptyStyleAttribute = '';

export type UpdateUrlFromCurrentPageLink = (
  hrefForCurrentPage?: string,
  paginatingToFirstPage?: boolean,
) => void;

export type ScrollContainer = HTMLElement | Window | null;

/**
 * All of our different flavors of Paginator use these props. As well, things like Timeline that
 * wrap Paginators and want to marshall down props also want to have this interface available to them.
 */
export interface CorePaginatorProps<T, U> {
  /**
   * `endpointApiRequest` describes the endpoint to hit when requesting the first page from the API.
   */
  endpointApiRequest?: IApiRequest<U>;

  /**
   * `getInitialPage` allows the parent component to provide an initial set of objects to render, and
   * the first nextLink, to allow this component to paginate. Pass in posts from the server if you
   * will be server-side rendering a page that uses Paginator.
   *
   * If you return `undefined` from `getInitialPage()`, Paginator will fetch from the `endpointUrl`
   * when it mounts.
   */
  getInitialPage?: () => PaginatorContentState<T> | undefined;

  /**
   * Picks objects out of the API responses. The paginator uses this to get objects for its internal
   * object management.
   */
  getObjectsFromResponse: (response: U) => T[];

  /**
   * `getNextLink` allows parent components to provide the next api endpoint to the Paginator. This
   * is useful in cases where the API does not provide next links (some of our API endpoints use
   * `offset` query params), and where the API does not provide next links in at the standard path
   * (`response.links.next`) (for example, timelines typically receive next links at the path
   * `response.timeline.links.next`).
   *
   * @default 'response.links.next' If no `getNextLink` is provided, it will be assumed that the
   * nextLink is at the path `response.links.next`.
   */
  getNextLink?: (response: U) => APILink | undefined;

  /**
   * There are instances where we want to completely ignore some elements in our timeline, and the best
   * way to do that is to completely omit them from being passed into the render function at all.
   * Things like masonry margin index, tabIndex, all that hullabaloo can be side-stepped if we can
   * communicate to the paginator "hey, for THIS object, don't even worry 'bout it".
   */
  isObjectOmittedFromRender?: (object: T) => boolean;

  /**
   * `loader` is a JSX element to be displayed when the paginator is requesting the next page. When
   * the Paginator is paginating upwards (`PaginatorDirection.Top`), the loader will be displayed
   * above the results from the `children` render prop. If the Paginator is paginating downwards
   * (`PaginatorDirection.Bottom`), the loader will be displayed below the results from the `children`
   * render prop.
   */
  loader?: JSX.Element;

  /**
   * `initialLoader` is a JSX element to be displayed when the paginator is requesting the first page.
   *
   * @default loader
   */
  initialLoader?: JSX.Element;

  /**
   * `emptyView` is a JSX element that will be displayed if the paginator requests data from the API
   * but receives a response with no objects.
   */
  emptyView?: ReactNode;

  /**
   * `errorView` is a JSX element that will be displayed if the paginator requests data from the API
   * but receives an errored response. If not provided it will drop the loader on error, but show nothing
   * in addition to the attempted render of `children` (which may or may not have any `objects` to render)
   */
  errorView?: ReactNode;

  /**
   * `direction` is the direction that the Paginator scrolls. `PaginatorDirection.Top` means that
   * the nextLink will be requested as the user reaches the top of the scroll container.
   * `PaginatorDirection.Bottom` indicates that the nextLink will be requested as the user reaches
   * the bottom of the scroll container.
   *
   * @default PaginatorDirection.Bottom
   */
  direction?: PaginatorDirection;

  /**
   * `scrollContainer` should be provided if the Paginator is displayed in a scrollable container
   * that is smaller than the window. The Paginator will listen to scroll events from within the
   * container, instead of scroll events on the window. Currently, using the j/k hotkeys can
   * result in odd behavior since they assume `scrollContainer` is structured the same way Peepr is.
   */
  scrollContainer?: ScrollContainer;

  /**
   * `pullToRefresh` is a flag that specifies whether the user should be able to pull-to-refresh
   * within this Paginator. If it is set to true, the Paginator will render a component that allows
   * the user to overscroll above the top of the container, and once a certain threshold is met,
   * fully refresh the data within the Paginator.
   */
  pullToRefresh?: boolean;

  /**
   * `lockScrollOnObjectUpdate` is a flag that will preserve the user's exact scroll position when objects update
   *  via transformObjects. ScrollDistanceObserver already maintains position when pagination occurs, but this can be used in
   *  other instances where React may reset the scroll position such as reordering timeline elements.
   */
  lockScrollOnObjectUpdate?: boolean;

  /**
   * `onPagination` is called when the Paginator finishes paginating, and when it first mounts.
   * In case you need something else from the response, we return it in its entirety.
   */
  onPagination?: ({ objects, nextLink, requestType, response }: OnPaginationParams<T, U>) => void;

  /**
   * `onPaginationError` is called when the Paginator finishes making an API request that results in
   * an error response from the API.
   */
  onPaginationError?: (onPaginationErrorParams: OnPaginationErrorParams) => void;

  /**
   * `onFetchNextPage` is called before the Paginator makes an API request for the next page of
   *  results.
   */
  onFetchNextPage?: () => void;

  /**
   * When paginating, sometimes we're going to want to update the URL to communicate where we
   * are in our pagination. This method is used to do that.
   */
  updateUrlFromCurrentPageLink?: UpdateUrlFromCurrentPageLink;

  /**
   * This is a useful prop if you're debugging, so that you can debug only one paginator. Often, we have many
   * on screen at a time, so it is tough to filter down to the appropriate logs.
   */
  debug?: boolean;
}

/**
 * `children` is a render prop that passes in objects that have been accumumated from requesting
 * additional data from the API as the user scrolls.
 *
 * It also passes a reference to the `refresh()` function which is used to refresh the paginator.
 * This is useful to pass to a custom PullToRefresh component, or a button that refreshes the timeline.
 *
 * It also passes a reference to a `transformObjects()` function, which modifies the objects stored
 * by the paginator when it is called. For example, this is useful if you want to update the
 * followed state of all of the posts in the dashboard when the user follows a blog.
 */
export interface PaginatorRenderProps<T> {
  objects: T[];
  refresh: () => void;
  transformObjects: (transform: (objects: T[]) => T[]) => void;
}

/**
 * In addition to the props required of any Paginator, ManualPaginators allow the caller to provide
 * additional props to be supplied to augment/alter the render/functionality of the ManualPaginator only.
 */
export interface ManualPaginatorOnlyProps<U> {
  manualPaginatorButtonCss?: ManualPaginatorButtonCSS;

  /**
   * There are times when we're pretty sure that we're not at the very start of a specific timeline/set of pagination
   * content, but we don't have a link to take us to the previous page. Damn. In those instances, we want to allow our
   * parent component to tell us to render the Previous button, but have it function as a refresh button instead.
   * This is most helpful on desktop where the pull to refresh functionality doesn't exist and the user would otherwise
   * have to hit refresh on the whole page in their browser, which might be undesirable.
   */
  prevButtonIsRefresh?: boolean;

  /**
   * `getPrevLink` allows parent components to provide the prev api endpoint to the Paginator. This
   * is useful in cases where the API provides its own prev links (some of our API endpoints do this).
   * If no `getPrevLink` is provided, it will be assumed that this value doesn't exist or needs
   * to be inferred from prior paginations.
   */
  getPrevLink?: (response: U) => APILink | undefined;

  /**
   * When enabled, new results are added to the existing results. The paginator can also use this
   * flag to make certain design/layout decisions eg. when enabled, don't show a 'previous' button,
   * and when clicking 'next' don't scroll to the top of the results.
   */
  concatenate?: boolean;

  /**
   * A custom version of the next button
   */
  nextButton?: JSX.Element;
}

/** Sometimes we have a manual paginator that lives somewhere that not only needs its buttons
 *  to be rendered differently than usual, but they need to be rendered in a way that we cannot
 *  supply in our normal CSS. This is usually things like overriding the colors with blog theme.
 */
export interface ManualPaginatorButtonCSS {
  prevButtonStyle?: CSSProperties;
  nextButtonStyle?: CSSProperties;

  /** Since this styling often changes with the viewport, we use a classname to
   * render this through CSS and NOT through a <Viewport /> HOC.
   */
  containerClassName?: string;

  /** Often when we render paginator buttons, we want to account for the lower right content.
   *  Specifically this is used to push over the 'next' button so it's not covered by it.
   *  The default behavior is TO account for it, so passing this override will remove this correction behavior.
   */
  doNotAccountForLowerRightContent?: boolean;
}
