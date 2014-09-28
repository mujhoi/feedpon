class FeedlyAuthenticator implements IFeedlyAuthenticator {
    /**
     * @ngInject
     */
    constructor(private $q: ng.IQService,
                private httpClient: IHttpClient) {
    }

    authenticate(input: AuthenticateInput, windowOpener: IWindowOpener): ng.IPromise<AuthenticateResponse> {
        var escape = encodeURIComponent;
        var authUrl = this.httpClient.endPoint + '/v3/auth/auth' +
            '?response_type=' + escape(input.response_type) +
            '&client_id=' + escape(input.client_id) +
            '&redirect_uri=' + escape(input.redirect_uri) +
            '&scope=' + escape(input.scope) +
            (input.state != null ? '&state=' + escape(input.state) : '');

        return windowOpener(authUrl, input.redirect_uri).then<AuthenticateResponse>((url) => {
            var deferred = this.$q.defer();
            var matchesForCode = url.match(/[?&]code=([^&]*)/);
            var matchesForState = url.match(/[?&]state=([^&]*)/);

            if (matchesForCode) {
                deferred.resolve({
                    code: matchesForCode[1],
                    state: matchesForState ? matchesForState[1] : null
                });
            } else {
                var matchesForError = url.match(/[&?]error=([^&]+)/);
                if (matchesForError) {
                    deferred.reject({
                        code: matchesForCode[1],
                        state: matchesForState ? matchesForState[1] : null
                    });
                }
            }

            return deferred.promise;
        })
    }

    exchangeToken(input: ExchangeTokenInput): ng.IPromise<ExchangeTokenResponse> {
        return this.doRequest('POST', '/v3/auth/token', input);
    }

    refreshToken(input: RefreshTokenInput): ng.IPromise<RefreshTokenResponse> {
        return this.doRequest('POST', '/v3/auth/token', input);
    }

    revokeToken(input: RevokeTokenInput): ng.IPromise<RevokeTokenResponse> {
        return this.doRequest('POST', '/v3/auth/token', input);
    }

    private doRequest<T>(method: string, path: string, data?: any): ng.IPromise<T> {
        return this.httpClient.request(method, path, data)
            .then((response) => response.data);
    }
}

export = FeedlyAuthenticator;