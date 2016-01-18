/// <reference path="../../typings/localForage.d.ts" />

import * as storageKeys from '../../constants/storageKeys'
import { Inject, Named } from '../../shared/di/annotations'
import { UnreadCount, IUnreadCountRepository } from './interfaces'

@Inject
export default class LocalForageUnreadCountRepository implements IUnreadCountRepository {
    constructor(@Named('LocalForage') private _localForage: LocalForage) {
    }

    getAll(): Promise<UnreadCount[]> {
        return this._localForage.getItem(storageKeys.UNREADCOUNTS)
    }

    putAll(unreadcounts: UnreadCount[]): Promise<void> {
        return this._localForage.setItem(storageKeys.UNREADCOUNTS, unreadcounts as any)
    }

    deleteAll(): Promise<void> {
        return this._localForage.removeItem(storageKeys.UNREADCOUNTS)
    }
}