import { CSSProperties } from 'react';
import { TransitionStatus } from 'react-transition-group/Transition';

export type TransitionStyles = { [K in TransitionStatus]?: CSSProperties };
