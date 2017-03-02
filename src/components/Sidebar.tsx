import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import Enumerable from '@emonkak/enumerable';

import Tree from 'components/parts/Tree';
import TreeBranch from 'components/parts/TreeBranch';
import TreeHeader from 'components/parts/TreeHeader';
import TreeLeaf from 'components/parts/TreeLeaf';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';
import { fetchSubscriptions } from 'messaging/actions';
import { replace } from 'utils/middlewares/historyActions';

import '@emonkak/enumerable/extensions/groupBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

const numberFormatter = new Intl.NumberFormat();

@connect((state: State) => ({
    subscriptions: state.subscriptions
}))
export default class Sidebar extends PureComponent<any, any> {
    static propTypes = {
        selectedValue: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
        subscriptions: PropTypes.array.isRequired,
    };

    componentWillMount() {
        const { dispatch } = this.props;

        dispatch(fetchSubscriptions());
    }

    handleSelect(event: any, selectedValue: any, activeType: React.ReactType) {
        const { dispatch } = this.props;

        dispatch(replace(selectedValue));
    }

    renderCategory(category: any, subscriptions: any[]) {
        const totalUnreadCount = subscriptions.reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        return (
                <TreeBranch key={`/categories/${category.categoryId}`}
                            value={`/categories/${category.categoryId}`}
                            className={classnames({ 'is-important': totalUnreadCount > 0 })}
                            primaryText={category.name}
                            secondaryText={totalUnreadCount > 0 ? numberFormatter.format(totalUnreadCount) : null}
                            icon={<i className="icon icon-16 icon-angle-down" />}>
                {subscriptions.map(subscription => this.renderSubscription(subscription))}
            </TreeBranch>
        );
    }

    renderSubscription(subscription: any) {
        return (
            <TreeLeaf key={`/subscriptions/${subscription.subscriptionId}`}
                      value={`/subscriptions/${subscription.subscriptionId}`}
                      className={classnames({ 'is-important': subscription.unreadCount > 0 })}
                      primaryText={subscription.title}
                      secondaryText={subscription.unreadCount > 0 ? numberFormatter.format(subscription.unreadCount) : null}
                      icon={<i className="icon icon-16 icon-file" />} />
        );
    }

    render() {
        const { selectedValue, subscriptions } = this.props;

        const totalUnreadCount = (subscriptions as any[]).reduce((total, subscription) => {
            return total + subscription.unreadCount;
        }, 0);

        const groupedSubscriptions = new Enumerable(subscriptions as any[])
            .groupBy(subscription => subscription.category.categoryId)
            .select(([categoryId, subscriptions]) => this.renderCategory(subscriptions[0].category, subscriptions))
            .toArray();

        return (
            <nav className="sidebar">
                <div className="sidebar-group">
                    <input type="text" className="search-box" placeholder="Search for feeds ..." />
                </div>
                <div className="sidebar-group">
                    <Tree value={selectedValue}
                          onSelect={this.handleSelect.bind(this)}>
                        <TreeLeaf key="/" value="/" primaryText="Dashboard" />
                        <TreeLeaf key="/all/" value="/all/" primaryText="All" secondaryText={numberFormatter.format(totalUnreadCount)} />
                        <TreeLeaf key="/pins/" value="/pins/" primaryText="Pins" secondaryText="12" />
                        <TreeHeader title="Updated 6 minutes ago"
                                    leftIcon={<i className="icon icon-16 icon-refresh" />}
                                    rightIcon={<i className="icon icon-16 icon-more" />} />
                        {groupedSubscriptions}
                        <TreeLeaf key="/settings/" value="/settings/" primaryText="Settings" />
                        <TreeLeaf key="/about/" value="/about/" primaryText="About..." />
                    </Tree>
                </div>
                <div className="sidebar-group">
                    <button type="button" className="button button-block button-default">New Subscription</button>
                </div>
                <div className="sidebar-group u-text-center">
                    <ul className="list-inline list-inline-slash">
                        <li><a href="#">emonkak@gmail.com</a></li>
                        <li><a href="#">Logout</a></li>
                    </ul>
                </div>
            </nav>
        );
    }
}