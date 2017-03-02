import React, { PropTypes, PureComponent, createElement } from 'react';

import Store from 'utils/Store';

export default function connect<TAction, TState>(mapStateToProps?: (state: TState) => any,
                                                 mapDispatchToProps?: (dispatch: (action: TAction) => void) => any): (component: React.ComponentClass<any>) => any {
    if (!mapStateToProps) {
        mapStateToProps = state => state;
    }

    if (!mapDispatchToProps) {
        mapDispatchToProps = dispatch => ({ dispatch });
    }

    return component => {
        return class StoreSubscriber extends PureComponent<any, TState> {
            static contextTypes = {
                store: PropTypes.instanceOf(Store).isRequired,
            };

            private dispatchProps: any;

            private subscription: { unsubscribe: () => void };

            constructor(props: any, context: any) {
                super(props, context);

                this.state = context.store.state as TState;
            }

            componentWillMount() {
                const store = this.context.store as Store<TAction, TState>;

                this.dispatchProps = mapDispatchToProps(store.dispatch.bind(store));
                this.subscription = store.subscribe(
                    state => this.setState(mapStateToProps(state))
                );
            }

            componentWillUnmount() {
                this.subscription.unsubscribe();

                this.dispatchProps = null;
                this.subscription = null;
            }

            render() {
                const { children } = this.props;
                const props = Object.assign({}, this.dispatchProps, this.state, this.props);

                return createElement(component, props, children);
            }
        };
    };
}