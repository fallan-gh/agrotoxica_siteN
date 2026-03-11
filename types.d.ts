import * as React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                alt?: string;
                'auto-rotate'?: boolean | string;
                'camera-controls'?: boolean | string;
                exposure?: string;
                'shadow-intensity'?: string;
                'shadow-softness'?: string;
                'environment-image'?: string;
                poster?: string;
            };
        }
    }
}
