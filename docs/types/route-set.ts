export const ROUTE_SETS = ['main', 'blogNetwork', 'media', 'embed'] as const;

type RouteSet = (typeof ROUTE_SETS)[number];

export default RouteSet; // eslint-disable-line import/no-default-export
