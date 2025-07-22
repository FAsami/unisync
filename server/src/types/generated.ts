export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  jsonb: { input: any; output: any; }
  timestamptz: { input: string; output: string; }
  uuid: { input: string; output: string; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "user.session" */
  delete_user_session?: Maybe<User_Session_Mutation_Response>;
  /** delete single row from the table: "user.session" */
  delete_user_session_by_pk?: Maybe<User_Session>;
  /** insert data into the table: "user.session" */
  insert_user_session?: Maybe<User_Session_Mutation_Response>;
  /** insert a single row into the table: "user.session" */
  insert_user_session_one?: Maybe<User_Session>;
  /** update data of the table: "user.session" */
  update_user_session?: Maybe<User_Session_Mutation_Response>;
  /** update single row of the table: "user.session" */
  update_user_session_by_pk?: Maybe<User_Session>;
  /** update multiples rows of table: "user.session" */
  update_user_session_many?: Maybe<Array<Maybe<User_Session_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_User_SessionArgs = {
  where: User_Session_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_User_SessionArgs = {
  objects: Array<User_Session_Insert_Input>;
  on_conflict?: InputMaybe<User_Session_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Session_OneArgs = {
  object: User_Session_Insert_Input;
  on_conflict?: InputMaybe<User_Session_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_User_SessionArgs = {
  _append?: InputMaybe<User_Session_Append_Input>;
  _delete_at_path?: InputMaybe<User_Session_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Session_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Session_Delete_Key_Input>;
  _inc?: InputMaybe<User_Session_Inc_Input>;
  _prepend?: InputMaybe<User_Session_Prepend_Input>;
  _set?: InputMaybe<User_Session_Set_Input>;
  where: User_Session_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Session_By_PkArgs = {
  _append?: InputMaybe<User_Session_Append_Input>;
  _delete_at_path?: InputMaybe<User_Session_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Session_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Session_Delete_Key_Input>;
  _inc?: InputMaybe<User_Session_Inc_Input>;
  _prepend?: InputMaybe<User_Session_Prepend_Input>;
  _set?: InputMaybe<User_Session_Set_Input>;
  pk_columns: User_Session_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Session_ManyArgs = {
  updates: Array<User_Session_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
};


export type Query_RootUser_SessionArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


export type Query_RootUser_Session_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


export type Query_RootUser_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
  /** fetch data from the table in a streaming manner: "user.session" */
  user_session_stream: Array<User_Session>;
};


export type Subscription_RootUser_SessionArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


export type Subscription_RootUser_Session_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


export type Subscription_RootUser_Session_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Session_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Session_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "user.session" */
export type User_Session = {
  __typename?: 'user_session';
  access_token: Scalars['String']['output'];
  access_token_expires_at: Scalars['timestamptz']['output'];
  created_at: Scalars['timestamptz']['output'];
  device_info?: Maybe<Scalars['jsonb']['output']>;
  id: Scalars['uuid']['output'];
  ip_address: Scalars['String']['output'];
  last_used_at: Scalars['timestamptz']['output'];
  refresh_token: Scalars['String']['output'];
  refresh_token_expires_at: Scalars['timestamptz']['output'];
  revoked: Scalars['Boolean']['output'];
  updated_at: Scalars['timestamptz']['output'];
  user_agent: Scalars['String']['output'];
  user_id?: Maybe<Scalars['Int']['output']>;
};


/** columns and relationships of "user.session" */
export type User_SessionDevice_InfoArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "user.session" */
export type User_Session_Aggregate = {
  __typename?: 'user_session_aggregate';
  aggregate?: Maybe<User_Session_Aggregate_Fields>;
  nodes: Array<User_Session>;
};

/** aggregate fields of "user.session" */
export type User_Session_Aggregate_Fields = {
  __typename?: 'user_session_aggregate_fields';
  avg?: Maybe<User_Session_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Session_Max_Fields>;
  min?: Maybe<User_Session_Min_Fields>;
  stddev?: Maybe<User_Session_Stddev_Fields>;
  stddev_pop?: Maybe<User_Session_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Session_Stddev_Samp_Fields>;
  sum?: Maybe<User_Session_Sum_Fields>;
  var_pop?: Maybe<User_Session_Var_Pop_Fields>;
  var_samp?: Maybe<User_Session_Var_Samp_Fields>;
  variance?: Maybe<User_Session_Variance_Fields>;
};


/** aggregate fields of "user.session" */
export type User_Session_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Session_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type User_Session_Append_Input = {
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate avg on columns */
export type User_Session_Avg_Fields = {
  __typename?: 'user_session_avg_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user.session". All fields are combined with a logical 'AND'. */
export type User_Session_Bool_Exp = {
  _and?: InputMaybe<Array<User_Session_Bool_Exp>>;
  _not?: InputMaybe<User_Session_Bool_Exp>;
  _or?: InputMaybe<Array<User_Session_Bool_Exp>>;
  access_token?: InputMaybe<String_Comparison_Exp>;
  access_token_expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  device_info?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  ip_address?: InputMaybe<String_Comparison_Exp>;
  last_used_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  refresh_token?: InputMaybe<String_Comparison_Exp>;
  refresh_token_expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  revoked?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.session" */
export enum User_Session_Constraint {
  /** unique or primary key constraint on columns "access_token" */
  SessionAccessTokenKey = 'session_access_token_key',
  /** unique or primary key constraint on columns "id" */
  SessionPkey = 'session_pkey',
  /** unique or primary key constraint on columns "refresh_token" */
  SessionRefreshTokenKey = 'session_refresh_token_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type User_Session_Delete_At_Path_Input = {
  device_info?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type User_Session_Delete_Elem_Input = {
  device_info?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type User_Session_Delete_Key_Input = {
  device_info?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "user.session" */
export type User_Session_Inc_Input = {
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user.session" */
export type User_Session_Insert_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  access_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  refresh_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  revoked?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type User_Session_Max_Fields = {
  __typename?: 'user_session_max_fields';
  access_token?: Maybe<Scalars['String']['output']>;
  access_token_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  last_used_at?: Maybe<Scalars['timestamptz']['output']>;
  refresh_token?: Maybe<Scalars['String']['output']>;
  refresh_token_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type User_Session_Min_Fields = {
  __typename?: 'user_session_min_fields';
  access_token?: Maybe<Scalars['String']['output']>;
  access_token_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  last_used_at?: Maybe<Scalars['timestamptz']['output']>;
  refresh_token?: Maybe<Scalars['String']['output']>;
  refresh_token_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** response of any mutation on the table "user.session" */
export type User_Session_Mutation_Response = {
  __typename?: 'user_session_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Session>;
};

/** on_conflict condition type for table "user.session" */
export type User_Session_On_Conflict = {
  constraint: User_Session_Constraint;
  update_columns?: Array<User_Session_Update_Column>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};

/** Ordering options when selecting data from "user.session". */
export type User_Session_Order_By = {
  access_token?: InputMaybe<Order_By>;
  access_token_expires_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  device_info?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  last_used_at?: InputMaybe<Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  refresh_token_expires_at?: InputMaybe<Order_By>;
  revoked?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.session */
export type User_Session_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type User_Session_Prepend_Input = {
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "user.session" */
export enum User_Session_Select_Column {
  /** column name */
  AccessToken = 'access_token',
  /** column name */
  AccessTokenExpiresAt = 'access_token_expires_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeviceInfo = 'device_info',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  LastUsedAt = 'last_used_at',
  /** column name */
  RefreshToken = 'refresh_token',
  /** column name */
  RefreshTokenExpiresAt = 'refresh_token_expires_at',
  /** column name */
  Revoked = 'revoked',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserAgent = 'user_agent',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "user.session" */
export type User_Session_Set_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  access_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  refresh_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  revoked?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type User_Session_Stddev_Fields = {
  __typename?: 'user_session_stddev_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Session_Stddev_Pop_Fields = {
  __typename?: 'user_session_stddev_pop_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Session_Stddev_Samp_Fields = {
  __typename?: 'user_session_stddev_samp_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_session" */
export type User_Session_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Session_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Session_Stream_Cursor_Value_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  access_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  refresh_token_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  revoked?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type User_Session_Sum_Fields = {
  __typename?: 'user_session_sum_fields';
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user.session" */
export enum User_Session_Update_Column {
  /** column name */
  AccessToken = 'access_token',
  /** column name */
  AccessTokenExpiresAt = 'access_token_expires_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeviceInfo = 'device_info',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  LastUsedAt = 'last_used_at',
  /** column name */
  RefreshToken = 'refresh_token',
  /** column name */
  RefreshTokenExpiresAt = 'refresh_token_expires_at',
  /** column name */
  Revoked = 'revoked',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserAgent = 'user_agent',
  /** column name */
  UserId = 'user_id'
}

export type User_Session_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<User_Session_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<User_Session_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<User_Session_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<User_Session_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Session_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<User_Session_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Session_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Session_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Session_Var_Pop_Fields = {
  __typename?: 'user_session_var_pop_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Session_Var_Samp_Fields = {
  __typename?: 'user_session_var_samp_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Session_Variance_Fields = {
  __typename?: 'user_session_variance_fields';
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

export type GetSessionQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetSessionQuery = { __typename?: 'query_root', user_session_by_pk?: { __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type GetSessionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetSessionsQuery = { __typename?: 'query_root', user_session: Array<{ __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string }> };

export type InsertSessionMutationVariables = Exact<{
  session: User_Session_Insert_Input;
}>;


export type InsertSessionMutation = { __typename?: 'mutation_root', insert_user_session_one?: { __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type UpdateSessionMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  session: User_Session_Set_Input;
}>;


export type UpdateSessionMutation = { __typename?: 'mutation_root', update_user_session_by_pk?: { __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type DeleteSessionMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteSessionMutation = { __typename?: 'mutation_root', delete_user_session_by_pk?: { __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type GetSessionByAccessTokenQueryVariables = Exact<{
  access_token: Scalars['String']['input'];
}>;


export type GetSessionByAccessTokenQuery = { __typename?: 'query_root', user_session: Array<{ __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string }> };

export type GetSessionByRefreshTokenQueryVariables = Exact<{
  refresh_token: Scalars['String']['input'];
}>;


export type GetSessionByRefreshTokenQuery = { __typename?: 'query_root', user_session: Array<{ __typename?: 'user_session', id: string, user_id?: number | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string }> };
