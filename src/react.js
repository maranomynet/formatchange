import React from 'react';

export const withMediaProps = (TargetComponent, formatMonitor, getPropsFromMedia) => {
    const getStateFromMedia = (
        getPropsFromMedia ||
        TargetComponent.getPropsFromMedia ||
        ((media) => media)
    );
    class FormatMonitored extends React.Component/*::<{},{}>*/ {
        /*::
            getPropsFromMedia: ({}) => {};
        */
        constructor(props/*:{}*/) {
            super(props);
            this.getStateFromMedia = (media) => {
                this.setState( getStateFromMedia(media) );
            };
            // NOTE: Don't run getStateFromMedia here because it
            // breaks the hydration of server-side-rendered HTML.
            this.state = {};
        }
        componentDidMount() {
            formatMonitor.subscribe(this.getStateFromMedia);
        }
        componentWillUnmount() {
            formatMonitor.unsubscribe(this.getStateFromMedia);
        }

        render() {
            return (
                <TargetComponent {...this.props} {...this.state} />
            );
        }
    }
    return FormatMonitored;
};
