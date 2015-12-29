/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />

import { Event, ISubscribable, Subscriber, Subscription } from './interfaces'
import { EventEmitter } from 'events'
import removeFromArray from '../utils/removeFromArray'

export default class EventDispatcher implements ISubscribable<Event<string>> {
    private _subscribers: Subscriber<any>[] = []

    dispatch<T extends Event<string>>(event: T): void {
        this._subscribers.forEach(subscriber => subscriber(event))
    }

    subscribe(subscriber: Subscriber<Event<string>>): Subscription {
        this._subscribers.push(subscriber)
        return () => removeFromArray(this._subscribers, subscriber)
    }
}
