import * as React from 'react';

export interface HeartbrainIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
  titleId?: string;
}

declare const HeartbrainIcon: React.ForwardRefExoticComponent<
  HeartbrainIconProps & React.RefAttributes<SVGSVGElement>
>;

export default HeartbrainIcon;