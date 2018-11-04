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
            this.state = getStateFromMedia(formatMonitor.media);
        }
        componentDidMount() {
            formatMonitor.subscribe(this.getStateFromMedia, false);
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
