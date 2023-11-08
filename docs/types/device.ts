export enum XUADevice { // eslint-disable-line no-restricted-syntax
  Smartphone = 'smartphone',
  Tablet = 'tablet',
  Desktop = 'desktop',
  Crawler = 'crawler',
  Mobile = 'mobile',
}

export enum DeviceType { // eslint-disable-line no-restricted-syntax
  Smartphone = 'smartphone',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

export function isEqualDeviceType(xUaDevice: XUADevice, deviceType: DeviceType) {
  const areBothSmartphone = xUaDevice === XUADevice.Smartphone &&
    deviceType === DeviceType.Smartphone;
  const areBothTablet = xUaDevice === XUADevice.Tablet && deviceType === DeviceType.Tablet;
  const areBothDesktop = xUaDevice === XUADevice.Desktop && deviceType === DeviceType.Desktop;
  const isCrawler = xUaDevice === XUADevice.Crawler;

  return areBothSmartphone || areBothTablet || areBothDesktop || isCrawler;
}

export function calculateDeviceType(
  xUaDevice: XUADevice | undefined,
  inferredDevice: DeviceType,
): DeviceType {
  switch (xUaDevice) {
    case XUADevice.Smartphone:
    case XUADevice.Mobile:
      return DeviceType.Smartphone;
    case XUADevice.Tablet:
      return DeviceType.Tablet;
    case XUADevice.Desktop:
      return DeviceType.Desktop;
    // For Crawlers, we look at the inferred device to determine if it is a smartphone or desktop crawler,
    // because the proxy does not tell us that information in the X-UA-Device header. We include the default
    // case here too because the X-UA-Device header is not set by the proxy in development.
    case XUADevice.Crawler:
    default:
      return inferredDevice;
  }
}

export default DeviceType; // eslint-disable-line import/no-default-export
