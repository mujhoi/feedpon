/// <reference path="../typings/chrome.d.ts" />

import { Action, IActionDispatcher } from './interfaces'

export default class ChromeBackgroundActionDispatcher implements IActionDispatcher {
    dispatch<A extends Action<string>>(action: A): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.extension.sendMessage(action, response => {
                if ('error' in response) {
                    resolve(response.error)
                } else {
                    reject(response.result)
                }
            })
        })
    }
}
