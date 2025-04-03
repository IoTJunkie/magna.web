/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AppUserTokenObtainPair {
  /**
   * Email
   * @minLength 1
   */
  email: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface Chat {
  bookmark_name?: string;
  /** Bookmarked */
  bookmarked?: boolean | null;
  /**
   * Content
   * @minLength 1
   */
  content: string;
  /**
   * Id
   * @format uuid
   */
  id?: string;
  /** Liked */
  liked?: boolean | null;
  /**
   * Response to
   * @format uuid
   */
  response_to?: string | null;
  /** Role */
  role: 'user' | 'assistant';
  source_info?: PageHighlight;
}

export interface PageHighlight {
  page_number?: number;
  page_content?: string;
  document_name?: string;
}

export interface ChatBookmarked {
  /** Bookmarked */
  bookmarked?: boolean | null;
}

export interface ChatLiked {
  /** Liked */
  liked?: boolean | null;
}

export interface ChatSession {
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /** Name */
  name?: string | null;
  /**
   * Policy
   * @format uuid
   */
  policy?: string | null;
}

export interface ChatSessionHistory {
  /**
   * Modified
   * @format date-time
   */
  modified?: string;
  /**
   * Created
   * @format date-time
   */
  created?: string;
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /** Name */
  name?: string | null;
  /**
   * Policy
   * @format uuid
   */
  policy?: string | null;
  /**
   * Case
   * @format uuid
   */
  case?: string | null;

  policy_name?: string;
}

export interface City {
  /**
   * Country
   * @minLength 1
   */
  country: string;
  /** ID */
  id?: number;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * State
   * @minLength 1
   */
  state: string;
}

export interface Country {
  /**
   * Code
   * 2-letters country codes
   * @minLength 1
   * @maxLength 2
   */
  code: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
}

export interface Document {
  /**
   * Text extraction status
   * True if text extraction process has been completed
   */
  extracted?: boolean;
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * Upload
   * @format uri
   */
  upload?: string;
  url?: string;
}

export interface DocumentContent {
  /** Content */
  content?: object | null;
  /**
   * Text extraction status
   * True if text extraction process has been completed
   */
  extracted?: boolean;
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * Upload
   * @format uri
   */
  upload?: string;
}

export interface HelpfulQuestion {
  /**
   * Question
   * @minLength 1
   * @maxLength 255
   */
  question: string;
  answer: string;
}

export interface Language {
  /**
   * Code
   * ISO 639-1 standard language codes
   * @minLength 1
   * @maxLength 10
   */
  code: string;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
}

export interface Policy {
  /**
   * Created
   * @format date-time
   */
  created?: string;
  documents?: Document[];
  /** Extraction status */
  extraction_status?: string;
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /**
   * Modified
   * @format date-time
   */
  modified?: string;
  /**
   * Name
   * @maxLength 255
   */
  name?: string | null;
  filter?: any;
  summary?: any;
}

export interface PolicyCreate {
  files?: string[];
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name?: string;
}

export interface PolicyDocument {
  /**
   * Created
   * @format date-time
   */
  created?: string;
  documents?: DocumentContent[];
  /** Extraction status */
  extraction_status?: string;
  /**
   * ID
   * @format uuid
   */
  id?: string;
  /**
   * Modified
   * @format date-time
   */
  modified?: string;
  /**
   * Name
   * @maxLength 255
   */
  name?: string | null;
}

export interface State {
  /** Country */
  country: string;
  /** ID */
  id?: number;
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
}

export interface TokenRefresh {
  /**
   * Access
   * @minLength 1
   */
  access?: string;
  /**
   * Refresh
   * @minLength 1
   */
  refresh: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://mypolicies.toplegalai.com/api';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title PLG Legal Toolbox
 * @version v1
 * @license BSD License
 * @termsOfService https://plglawyersfl.com/
 * @baseUrl https://mypolicies.toplegalai.com/api
 * @contact <shubham.dipt@gmail.com>
 *
 * PLG legal toolbox
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  accounts = {
    /**
     * No description
     *
     * @tags accounts
     * @name AccountsChangePasswordCreate
     * @request POST:/accounts/change-password/
     * @secure
     * @response `200` `void` Success
     * @response `400` `void` Error
     */
    accountsChangePasswordCreate: (
      data: {
        new_password_1: string;
        new_password_2: string;
        old_password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/change-password/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsLogoutCreate
     * @request POST:/accounts/logout/
     * @secure
     * @response `201` `void`
     */
    accountsLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/accounts/logout/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Retrieve a AppUserProfile instance.
     *
     * @tags accounts
     * @name AccountsProfileList
     * @request GET:/accounts/profile/
     * @secure
     * @response `200` `void`
     */
    accountsProfileList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/accounts/profile/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Update an AppUserProfile instance.
     *
     * @tags accounts
     * @name AccountsProfileUpdate
     * @request PUT:/accounts/profile/
     * @secure
     * @response `200` `void` Success
     * @response `400` `void` Error
     * @response `404` `void` Not found
     */
    accountsProfileUpdate: (
      data: {
        address_line_1?: string;
        address_line_2?: string;
        city?: string;
        country?: string;
        email: string;
        first_name?: string;
        last_name?: string;
        mobile?: string;
        phone?: string;
        state?: string;
        zip_code?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/profile/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Deactivate an AppUserProfile instance.
     *
     * @tags accounts
     * @name AccountsProfileDelete
     * @request DELETE:/accounts/profile/
     * @secure
     * @response `204` `void`
     */
    accountsProfileDelete: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/accounts/profile/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsRegisterCreate
     * @request POST:/accounts/register/
     * @secure
     * @response `201` `void` Success
     * @response `400` `void` Error
     */
    accountsRegisterCreate: (
      data: {
        email: string;
        first_name: string;
        last_name: string;
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/register/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsResendVerificationEmailCreate
     * @request POST:/accounts/resend-verification-email/
     * @secure
     * @response `200` `void` Success
     * @response `400` `void` Error
     */
    accountsResendVerificationEmailCreate: (
      data: {
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/resend-verification-email/`,
        method: 'POST',
        body: data,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsResetPasswordCreate
     * @request POST:/accounts/reset-password/
     * @secure
     * @response `200` `void` Success
     * @response `400` `void` Error
     */
    accountsResetPasswordCreate: (
      data: {
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/reset-password/`,
        method: 'POST',
        body: data,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsResetPasswordConfirmCreate
     * @request POST:/accounts/reset-password/{uidb64}/{token}/confirm/
     * @secure
     * @response `200` `void` Success
     * @response `400` `void` Error
     */
    accountsResetPasswordConfirmCreate: (
      uidb64: string,
      token: string,
      data: {
        new_password_1: string;
        new_password_2: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/accounts/reset-password/${uidb64}/${token}/confirm/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsTokenCreate
     * @request POST:/accounts/token/
     * @secure
     * @response `201` `AppUserTokenObtainPair`
     */
    accountsTokenCreate: (data: AppUserTokenObtainPair, params: RequestParams = {}) =>
      this.request<AppUserTokenObtainPair, any>({
        path: `/accounts/token/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid.
     *
     * @tags accounts
     * @name AccountsTokenRefreshCreate
     * @request POST:/accounts/token/refresh/
     * @secure
     * @response `201` `TokenRefresh`
     */
    accountsTokenRefreshCreate: (data: TokenRefresh, params: RequestParams = {}) =>
      this.request<TokenRefresh, any>({
        path: `/accounts/token/refresh/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsUserList
     * @request GET:/accounts/user/
     * @secure
     * @response `200` `void`
     */
    accountsUserList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/accounts/user/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags accounts
     * @name AccountsVerifyEmailConfirmList
     * @request GET:/accounts/verify-email/{uidb64}/{token}/confirm/
     * @secure
     * @response `200` `void`
     */
    accountsVerifyEmailConfirmList: (uidb64: string, token: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/accounts/verify-email/${uidb64}/${token}/confirm/`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
  chats = {
    /**
     * No description
     *
     * @tags chats
     * @name ChatsHelpfulQuestionsGeneralList
     * @request GET:/chats/helpful-questions/general/
     * @secure
     * @response `200` `(HelpfulQuestion)[]`
     */
    chatsHelpfulQuestionsGeneralList: (params: RequestParams = {}) =>
      this.request<HelpfulQuestion[], any>({
        path: `/chats/helpful-questions/general/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsHelpfulQuestionsPolicyList
     * @request GET:/chats/helpful-questions/policy/
     * @secure
     * @response `200` `(HelpfulQuestion)[]`
     */
    chatsHelpfulQuestionsPolicyList: (params: RequestParams = {}) =>
      this.request<HelpfulQuestion[], any>({
        path: `/chats/helpful-questions/policy/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags chats
 * @name ChatsHistoryLegalList
 * @request GET:/chats/history/legal/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (ChatSessionHistory)[],

}`
 */
    chatsHistoryLegalList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: ChatSessionHistory[];
        },
        any
      >({
        path: `/chats/history/legal/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags chats
 * @name ChatsHistoryPolicyList
 * @request GET:/chats/history/policy/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (ChatSessionHistory)[],

}`
 */
    chatsHistoryPolicyList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: ChatSessionHistory[];
        },
        any
      >({
        path: `/chats/history/policy/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags chats
 * @name ChatsHistoryPolicyRead
 * @request GET:/chats/history/policy/{policy_id}/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (ChatSessionHistory)[],

}`
 */
    chatsHistoryPolicyRead: (
      policyId: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: ChatSessionHistory[];
        },
        any
      >({
        path: `/chats/history/policy/${policyId}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionChatBookmarkPartialUpdate
     * @request PATCH:/chats/session/chat/{id}/bookmark/
     * @secure
     * @response `200` `ChatBookmarked`
     */
    chatsSessionChatBookmarkPartialUpdate: (
      id: string,
      data: ChatBookmarked,
      params: RequestParams = {},
    ) =>
      this.request<ChatBookmarked, any>({
        path: `/chats/session/chat/${id}/bookmark/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionChatLikePartialUpdate
     * @request PATCH:/chats/session/chat/{id}/like/
     * @secure
     * @response `200` `ChatLiked`
     */
    chatsSessionChatLikePartialUpdate: (id: string, data: ChatLiked, params: RequestParams = {}) =>
      this.request<ChatLiked, any>({
        path: `/chats/session/chat/${id}/like/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionCreateCreate
     * @request POST:/chats/session/create/
     * @secure
     * @response `201` `ChatSession`
     */
    chatsSessionCreateCreate: (data: ChatSession, params: RequestParams = {}) =>
      this.request<ChatSession, any>({
        path: `/chats/session/create/`,
        method: 'POST',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionDeleteDelete
     * @request DELETE:/chats/session/{id}/delete/
     * @secure
     * @response `204` `void`
     */
    chatsSessionDeleteDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/chats/session/${id}/delete/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionUpdateUpdate
     * @request PUT:/chats/session/{id}/update/
     * @secure
     * @response `200` `ChatSession`
     */
    chatsSessionUpdateUpdate: (id: string, data: ChatSession, params: RequestParams = {}) =>
      this.request<ChatSession, any>({
        path: `/chats/session/${id}/update/`,
        method: 'PUT',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionUpdatePartialUpdate
     * @request PATCH:/chats/session/{id}/update/
     * @secure
     * @response `200` `ChatSession`
     */
    chatsSessionUpdatePartialUpdate: (id: string, data: ChatSession, params: RequestParams = {}) =>
      this.request<ChatSession, any>({
        path: `/chats/session/${id}/update/`,
        method: 'PATCH',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsChatCreateCreate
     * @request POST:/chats/{session_id}/chat/create/
     * @secure
     * @response `201` `void` Success
     * @response `400` `void` Error
     */
    chatsChatCreateCreate: (
      sessionId: string,
      data: {
        content: string;
        role: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/chats/${sessionId}/chat/create/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsChatRefreshLatestResponseList
     * @request GET:/chats/{session_id}/chat/refresh-latest-response/
     * @secure
     * @response `200` `void`
     */
    chatsChatRefreshLatestResponseList: (sessionId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/chats/${sessionId}/chat/refresh-latest-response/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags chats
     * @name ChatsSessionList
     * @request GET:/chats/{session_id}/session/
     * @secure
     * @response `200` `(Chat)[]`
     */
    chatsSessionList: (sessionId: string, params: RequestParams = {}) =>
      this.request<Chat[], any>({
        path: `/chats/${sessionId}/session/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  documents = {
    /**
     * No description
     *
     * @tags documents
     * @name DocumentsRead
     * @request GET:/documents/{id}/
     * @secure
     * @response `200` `DocumentContent`
     */
    documentsRead: (id: string, params: RequestParams = {}) =>
      this.request<DocumentContent, any>({
        path: `/documents/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags documents
     * @name DocumentsDeleteDelete
     * @request DELETE:/documents/{id}/delete/
     * @secure
     * @response `204` `void`
     */
    documentsDeleteDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/documents/${id}/delete/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  policies = {
    /**
 * No description
 *
 * @tags policies
 * @name PoliciesList
 * @request GET:/policies/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (Policy)[],

}`
 */
    policiesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: Policy[];
        },
        any
      >({
        path: `/policies/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesCreateCreate
     * @request POST:/policies/create/
     * @secure
     * @response `201` `void` Success
     * @response `400` `void` Error
     */
    policiesCreateCreate: (
      data: {
        /** @format binary */
        files?: File;
        name: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/policies/create/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesRead
     * @request GET:/policies/{id}/
     * @secure
     * @response `200` `PolicyDocument`
     */
    policiesRead: (id: string, params: RequestParams = {}) =>
      this.request<PolicyDocument, any>({
        path: `/policies/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesDeleteDelete
     * @request DELETE:/policies/{id}/delete/
     * @secure
     * @response `204` `void`
     */
    policiesDeleteDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/policies/${id}/delete/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesSummaryList
     * @request GET:/policies/{id}/summary/
     * @secure
     * @response `200` `void`
     */
    policiesSummaryList: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/policies/${id}/summary/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesTextExtractionStatusList
     * @request GET:/policies/{id}/text-extraction-status/
     * @secure
     * @response `200` `void`
     */
    policiesTextExtractionStatusList: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/policies/${id}/text-extraction-status/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesUpdateUpdate
     * @request PUT:/policies/{id}/update/
     * @secure
     * @response `200` `PolicyCreate`
     */
    policiesUpdateUpdate: (id: string, data: PolicyCreate, params: RequestParams = {}) =>
      this.request<PolicyCreate, any>({
        path: `/policies/${id}/update/`,
        method: 'PUT',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags policies
     * @name PoliciesUpdatePartialUpdate
     * @request PATCH:/policies/{id}/update/
     * @secure
     * @response `200` `PolicyCreate`
     */
    policiesUpdatePartialUpdate: (id: string, data: PolicyCreate, params: RequestParams = {}) =>
      this.request<PolicyCreate, any>({
        path: `/policies/${id}/update/`,
        method: 'PATCH',
        body: data,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  utilities = {
    /**
     * No description
     *
     * @tags utilities
     * @name UtilitiesCitiesList
     * @request GET:/utilities/cities/
     * @secure
     * @response `200` `(City)[]`
     */
    utilitiesCitiesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Filter cities whose names start with the provided value */
        startswith?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<City[], any>({
        path: `/utilities/cities/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags utilities
 * @name UtilitiesCountriesList
 * @request GET:/utilities/countries/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (Country)[],

}`
 */
    utilitiesCountriesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: Country[];
        },
        any
      >({
        path: `/utilities/countries/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags utilities
 * @name UtilitiesLanguagesList
 * @request GET:/utilities/languages/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (Language)[],

}`
 */
    utilitiesLanguagesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: Language[];
        },
        any
      >({
        path: `/utilities/languages/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
 * No description
 *
 * @tags utilities
 * @name UtilitiesStatesList
 * @request GET:/utilities/states/
 * @secure
 * @response `200` `{
    count: number,
  \** @format uri *\
    next?: string | null,
  \** @format uri *\
    previous?: string | null,
    results: (State)[],

}`
 */
    utilitiesStatesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          count: number;
          /** @format uri */
          next?: string | null;
          /** @format uri */
          previous?: string | null;
          results: State[];
        },
        any
      >({
        path: `/utilities/states/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
