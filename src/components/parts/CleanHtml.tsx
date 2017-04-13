import React, { PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import cleanNode from 'supports/dom/cleanNode';
import walkNode from 'supports/dom/walkNode';

interface Props {
    className?: string;
    baseUrl: string;
    html: string | null;
}

export default class CleanHtml extends PureComponent<Props, {}> {
    static propTypes = {
        baseUrl: PropTypes.string.isRequired,
        className: PropTypes.string,
        html: PropTypes.string
    };

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const { baseUrl, html } = this.props;
        const container = findDOMNode(this);

        if (html != null) {
            const parser = new DOMParser();
            const parsedDocument = parser.parseFromString(html, 'text/html');

            for (const child of parsedDocument.body.childNodes) {
                walkNode(child, (node) => cleanNode(node, baseUrl));
            }

            const fragment = document.createDocumentFragment();

            fragment.appendChild(parsedDocument.documentElement);

            if (container.firstChild) {
                container.replaceChild(fragment, container.firstChild);
            } else {
                container.appendChild(fragment);
            }
        }
    }

    render() {
        const { className } = this.props;

        return (
            <div className={className}></div>
        );
    }
}