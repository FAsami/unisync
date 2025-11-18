import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  timestamptz: { input: string; output: string; }
  uuid: { input: string; output: string; }
};

export type ApiResponse = {
  __typename?: 'ApiResponse';
  data?: Maybe<Scalars['JSON']['output']>;
  error?: Maybe<ErrorObject>;
  message?: Maybe<Scalars['String']['output']>;
  meta: MetaObject;
  success: Scalars['Boolean']['output'];
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

export type ErrorObject = {
  __typename?: 'ErrorObject';
  code?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['JSON']['output']>;
  message: Scalars['String']['output'];
};

export enum IdentifierTypeEnum {
  Email = 'EMAIL',
  Phone = 'PHONE'
}

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

export type MetaObject = {
  __typename?: 'MetaObject';
  duration?: Maybe<Scalars['Float']['output']>;
  method: Scalars['String']['output'];
  path: Scalars['String']['output'];
  requestId?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['String']['output'];
};

export enum OtpPurposeEnum {
  Login = 'LOGIN',
  PasswordReset = 'PASSWORD_RESET',
  Signup = 'SIGNUP'
}

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
  /** delete data from the table: "settings.config" */
  delete_settings_config?: Maybe<Settings_Config_Mutation_Response>;
  /** delete single row from the table: "settings.config" */
  delete_settings_config_by_pk?: Maybe<Settings_Config>;
  /** delete data from the table: "user.account" */
  delete_user_account?: Maybe<User_Account_Mutation_Response>;
  /** delete single row from the table: "user.account" */
  delete_user_account_by_pk?: Maybe<User_Account>;
  /** delete data from the table: "user.otp_rate_limit" */
  delete_user_otp_rate_limit?: Maybe<User_Otp_Rate_Limit_Mutation_Response>;
  /** delete single row from the table: "user.otp_rate_limit" */
  delete_user_otp_rate_limit_by_pk?: Maybe<User_Otp_Rate_Limit>;
  /** delete data from the table: "user.otp_transaction" */
  delete_user_otp_transaction?: Maybe<User_Otp_Transaction_Mutation_Response>;
  /** delete single row from the table: "user.otp_transaction" */
  delete_user_otp_transaction_by_pk?: Maybe<User_Otp_Transaction>;
  /** delete data from the table: "user.session" */
  delete_user_session?: Maybe<User_Session_Mutation_Response>;
  /** delete single row from the table: "user.session" */
  delete_user_session_by_pk?: Maybe<User_Session>;
  /** insert data into the table: "settings.config" */
  insert_settings_config?: Maybe<Settings_Config_Mutation_Response>;
  /** insert a single row into the table: "settings.config" */
  insert_settings_config_one?: Maybe<Settings_Config>;
  /** insert data into the table: "user.account" */
  insert_user_account?: Maybe<User_Account_Mutation_Response>;
  /** insert a single row into the table: "user.account" */
  insert_user_account_one?: Maybe<User_Account>;
  /** insert data into the table: "user.otp_rate_limit" */
  insert_user_otp_rate_limit?: Maybe<User_Otp_Rate_Limit_Mutation_Response>;
  /** insert a single row into the table: "user.otp_rate_limit" */
  insert_user_otp_rate_limit_one?: Maybe<User_Otp_Rate_Limit>;
  /** insert data into the table: "user.otp_transaction" */
  insert_user_otp_transaction?: Maybe<User_Otp_Transaction_Mutation_Response>;
  /** insert a single row into the table: "user.otp_transaction" */
  insert_user_otp_transaction_one?: Maybe<User_Otp_Transaction>;
  /** insert data into the table: "user.session" */
  insert_user_session?: Maybe<User_Session_Mutation_Response>;
  /** insert a single row into the table: "user.session" */
  insert_user_session_one?: Maybe<User_Session>;
  sendOTP: ApiResponse;
  /** update data of the table: "settings.config" */
  update_settings_config?: Maybe<Settings_Config_Mutation_Response>;
  /** update single row of the table: "settings.config" */
  update_settings_config_by_pk?: Maybe<Settings_Config>;
  /** update multiples rows of table: "settings.config" */
  update_settings_config_many?: Maybe<Array<Maybe<Settings_Config_Mutation_Response>>>;
  /** update data of the table: "user.account" */
  update_user_account?: Maybe<User_Account_Mutation_Response>;
  /** update single row of the table: "user.account" */
  update_user_account_by_pk?: Maybe<User_Account>;
  /** update multiples rows of table: "user.account" */
  update_user_account_many?: Maybe<Array<Maybe<User_Account_Mutation_Response>>>;
  /** update data of the table: "user.otp_rate_limit" */
  update_user_otp_rate_limit?: Maybe<User_Otp_Rate_Limit_Mutation_Response>;
  /** update single row of the table: "user.otp_rate_limit" */
  update_user_otp_rate_limit_by_pk?: Maybe<User_Otp_Rate_Limit>;
  /** update multiples rows of table: "user.otp_rate_limit" */
  update_user_otp_rate_limit_many?: Maybe<Array<Maybe<User_Otp_Rate_Limit_Mutation_Response>>>;
  /** update data of the table: "user.otp_transaction" */
  update_user_otp_transaction?: Maybe<User_Otp_Transaction_Mutation_Response>;
  /** update single row of the table: "user.otp_transaction" */
  update_user_otp_transaction_by_pk?: Maybe<User_Otp_Transaction>;
  /** update multiples rows of table: "user.otp_transaction" */
  update_user_otp_transaction_many?: Maybe<Array<Maybe<User_Otp_Transaction_Mutation_Response>>>;
  /** update data of the table: "user.session" */
  update_user_session?: Maybe<User_Session_Mutation_Response>;
  /** update single row of the table: "user.session" */
  update_user_session_by_pk?: Maybe<User_Session>;
  /** update multiples rows of table: "user.session" */
  update_user_session_many?: Maybe<Array<Maybe<User_Session_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Settings_ConfigArgs = {
  where: Settings_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Settings_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_AccountArgs = {
  where: User_Account_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Account_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_Otp_Rate_LimitArgs = {
  where: User_Otp_Rate_Limit_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Otp_Rate_Limit_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_Otp_TransactionArgs = {
  where: User_Otp_Transaction_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Otp_Transaction_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
export type Mutation_RootInsert_Settings_ConfigArgs = {
  objects: Array<Settings_Config_Insert_Input>;
  on_conflict?: InputMaybe<Settings_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Settings_Config_OneArgs = {
  object: Settings_Config_Insert_Input;
  on_conflict?: InputMaybe<Settings_Config_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_AccountArgs = {
  objects: Array<User_Account_Insert_Input>;
  on_conflict?: InputMaybe<User_Account_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Account_OneArgs = {
  object: User_Account_Insert_Input;
  on_conflict?: InputMaybe<User_Account_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Otp_Rate_LimitArgs = {
  objects: Array<User_Otp_Rate_Limit_Insert_Input>;
  on_conflict?: InputMaybe<User_Otp_Rate_Limit_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Otp_Rate_Limit_OneArgs = {
  object: User_Otp_Rate_Limit_Insert_Input;
  on_conflict?: InputMaybe<User_Otp_Rate_Limit_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Otp_TransactionArgs = {
  objects: Array<User_Otp_Transaction_Insert_Input>;
  on_conflict?: InputMaybe<User_Otp_Transaction_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Otp_Transaction_OneArgs = {
  object: User_Otp_Transaction_Insert_Input;
  on_conflict?: InputMaybe<User_Otp_Transaction_On_Conflict>;
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
export type Mutation_RootSendOtpArgs = {
  identifier: Scalars['String']['input'];
  identifierType: IdentifierTypeEnum;
  purpose: OtpPurposeEnum;
};


/** mutation root */
export type Mutation_RootUpdate_Settings_ConfigArgs = {
  _append?: InputMaybe<Settings_Config_Append_Input>;
  _delete_at_path?: InputMaybe<Settings_Config_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Settings_Config_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Settings_Config_Delete_Key_Input>;
  _inc?: InputMaybe<Settings_Config_Inc_Input>;
  _prepend?: InputMaybe<Settings_Config_Prepend_Input>;
  _set?: InputMaybe<Settings_Config_Set_Input>;
  where: Settings_Config_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Settings_Config_By_PkArgs = {
  _append?: InputMaybe<Settings_Config_Append_Input>;
  _delete_at_path?: InputMaybe<Settings_Config_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Settings_Config_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Settings_Config_Delete_Key_Input>;
  _inc?: InputMaybe<Settings_Config_Inc_Input>;
  _prepend?: InputMaybe<Settings_Config_Prepend_Input>;
  _set?: InputMaybe<Settings_Config_Set_Input>;
  pk_columns: Settings_Config_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Settings_Config_ManyArgs = {
  updates: Array<Settings_Config_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_AccountArgs = {
  _set?: InputMaybe<User_Account_Set_Input>;
  where: User_Account_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Account_By_PkArgs = {
  _set?: InputMaybe<User_Account_Set_Input>;
  pk_columns: User_Account_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Account_ManyArgs = {
  updates: Array<User_Account_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_Rate_LimitArgs = {
  _inc?: InputMaybe<User_Otp_Rate_Limit_Inc_Input>;
  _set?: InputMaybe<User_Otp_Rate_Limit_Set_Input>;
  where: User_Otp_Rate_Limit_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_Rate_Limit_By_PkArgs = {
  _inc?: InputMaybe<User_Otp_Rate_Limit_Inc_Input>;
  _set?: InputMaybe<User_Otp_Rate_Limit_Set_Input>;
  pk_columns: User_Otp_Rate_Limit_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_Rate_Limit_ManyArgs = {
  updates: Array<User_Otp_Rate_Limit_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_TransactionArgs = {
  _inc?: InputMaybe<User_Otp_Transaction_Inc_Input>;
  _set?: InputMaybe<User_Otp_Transaction_Set_Input>;
  where: User_Otp_Transaction_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_Transaction_By_PkArgs = {
  _inc?: InputMaybe<User_Otp_Transaction_Inc_Input>;
  _set?: InputMaybe<User_Otp_Transaction_Set_Input>;
  pk_columns: User_Otp_Transaction_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Otp_Transaction_ManyArgs = {
  updates: Array<User_Otp_Transaction_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_SessionArgs = {
  _append?: InputMaybe<User_Session_Append_Input>;
  _delete_at_path?: InputMaybe<User_Session_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Session_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Session_Delete_Key_Input>;
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
  /** fetch data from the table: "settings.config" */
  settings_config: Array<Settings_Config>;
  /** fetch aggregated fields from the table: "settings.config" */
  settings_config_aggregate: Settings_Config_Aggregate;
  /** fetch data from the table: "settings.config" using primary key columns */
  settings_config_by_pk?: Maybe<Settings_Config>;
  /** fetch data from the table: "user.account" */
  user_account: Array<User_Account>;
  /** fetch aggregated fields from the table: "user.account" */
  user_account_aggregate: User_Account_Aggregate;
  /** fetch data from the table: "user.account" using primary key columns */
  user_account_by_pk?: Maybe<User_Account>;
  /** fetch data from the table: "user.otp_rate_limit" */
  user_otp_rate_limit: Array<User_Otp_Rate_Limit>;
  /** fetch aggregated fields from the table: "user.otp_rate_limit" */
  user_otp_rate_limit_aggregate: User_Otp_Rate_Limit_Aggregate;
  /** fetch data from the table: "user.otp_rate_limit" using primary key columns */
  user_otp_rate_limit_by_pk?: Maybe<User_Otp_Rate_Limit>;
  /** fetch data from the table: "user.otp_transaction" */
  user_otp_transaction: Array<User_Otp_Transaction>;
  /** fetch aggregated fields from the table: "user.otp_transaction" */
  user_otp_transaction_aggregate: User_Otp_Transaction_Aggregate;
  /** fetch data from the table: "user.otp_transaction" using primary key columns */
  user_otp_transaction_by_pk?: Maybe<User_Otp_Transaction>;
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
};


export type Query_RootSettings_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Settings_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Settings_Config_Order_By>>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};


export type Query_RootSettings_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Settings_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Settings_Config_Order_By>>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};


export type Query_RootSettings_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Query_RootUser_AccountArgs = {
  distinct_on?: InputMaybe<Array<User_Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Account_Order_By>>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};


export type Query_RootUser_Account_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Account_Order_By>>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};


export type Query_RootUser_Account_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUser_Otp_Rate_LimitArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Rate_Limit_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Rate_Limit_Order_By>>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};


export type Query_RootUser_Otp_Rate_Limit_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Rate_Limit_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Rate_Limit_Order_By>>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};


export type Query_RootUser_Otp_Rate_Limit_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUser_Otp_TransactionArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Transaction_Order_By>>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
};


export type Query_RootUser_Otp_Transaction_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Transaction_Order_By>>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
};


export type Query_RootUser_Otp_Transaction_By_PkArgs = {
  id: Scalars['uuid']['input'];
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

/** This will store configuration across all the available platforms */
export type Settings_Config = {
  __typename?: 'settings_config';
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['Int']['output'];
  identifier: Scalars['String']['output'];
  scope: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  value?: Maybe<Scalars['jsonb']['output']>;
};


/** This will store configuration across all the available platforms */
export type Settings_ConfigValueArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "settings.config" */
export type Settings_Config_Aggregate = {
  __typename?: 'settings_config_aggregate';
  aggregate?: Maybe<Settings_Config_Aggregate_Fields>;
  nodes: Array<Settings_Config>;
};

/** aggregate fields of "settings.config" */
export type Settings_Config_Aggregate_Fields = {
  __typename?: 'settings_config_aggregate_fields';
  avg?: Maybe<Settings_Config_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Settings_Config_Max_Fields>;
  min?: Maybe<Settings_Config_Min_Fields>;
  stddev?: Maybe<Settings_Config_Stddev_Fields>;
  stddev_pop?: Maybe<Settings_Config_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Settings_Config_Stddev_Samp_Fields>;
  sum?: Maybe<Settings_Config_Sum_Fields>;
  var_pop?: Maybe<Settings_Config_Var_Pop_Fields>;
  var_samp?: Maybe<Settings_Config_Var_Samp_Fields>;
  variance?: Maybe<Settings_Config_Variance_Fields>;
};


/** aggregate fields of "settings.config" */
export type Settings_Config_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Settings_Config_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Settings_Config_Append_Input = {
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate avg on columns */
export type Settings_Config_Avg_Fields = {
  __typename?: 'settings_config_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "settings.config". All fields are combined with a logical 'AND'. */
export type Settings_Config_Bool_Exp = {
  _and?: InputMaybe<Array<Settings_Config_Bool_Exp>>;
  _not?: InputMaybe<Settings_Config_Bool_Exp>;
  _or?: InputMaybe<Array<Settings_Config_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  identifier?: InputMaybe<String_Comparison_Exp>;
  scope?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  value?: InputMaybe<Jsonb_Comparison_Exp>;
};

/** unique or primary key constraints on table "settings.config" */
export enum Settings_Config_Constraint {
  /** unique or primary key constraint on columns "scope", "identifier" */
  ConfigIdentifierScopeKey = 'config_identifier_scope_key',
  /** unique or primary key constraint on columns "id" */
  ConfigPkey = 'config_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Settings_Config_Delete_At_Path_Input = {
  value?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Settings_Config_Delete_Elem_Input = {
  value?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Settings_Config_Delete_Key_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "settings.config" */
export type Settings_Config_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "settings.config" */
export type Settings_Config_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate max on columns */
export type Settings_Config_Max_Fields = {
  __typename?: 'settings_config_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Settings_Config_Min_Fields = {
  __typename?: 'settings_config_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "settings.config" */
export type Settings_Config_Mutation_Response = {
  __typename?: 'settings_config_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Settings_Config>;
};

/** on_conflict condition type for table "settings.config" */
export type Settings_Config_On_Conflict = {
  constraint: Settings_Config_Constraint;
  update_columns?: Array<Settings_Config_Update_Column>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};

/** Ordering options when selecting data from "settings.config". */
export type Settings_Config_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  identifier?: InputMaybe<Order_By>;
  scope?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: settings.config */
export type Settings_Config_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Settings_Config_Prepend_Input = {
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "settings.config" */
export enum Settings_Config_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  Scope = 'scope',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "settings.config" */
export type Settings_Config_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate stddev on columns */
export type Settings_Config_Stddev_Fields = {
  __typename?: 'settings_config_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Settings_Config_Stddev_Pop_Fields = {
  __typename?: 'settings_config_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Settings_Config_Stddev_Samp_Fields = {
  __typename?: 'settings_config_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "settings_config" */
export type Settings_Config_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Settings_Config_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Settings_Config_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate sum on columns */
export type Settings_Config_Sum_Fields = {
  __typename?: 'settings_config_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "settings.config" */
export enum Settings_Config_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  Scope = 'scope',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Value = 'value'
}

export type Settings_Config_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Settings_Config_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Settings_Config_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Settings_Config_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Settings_Config_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Settings_Config_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Settings_Config_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Settings_Config_Set_Input>;
  /** filter the rows which have to be updated */
  where: Settings_Config_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Settings_Config_Var_Pop_Fields = {
  __typename?: 'settings_config_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Settings_Config_Var_Samp_Fields = {
  __typename?: 'settings_config_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Settings_Config_Variance_Fields = {
  __typename?: 'settings_config_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "settings.config" */
  settings_config: Array<Settings_Config>;
  /** fetch aggregated fields from the table: "settings.config" */
  settings_config_aggregate: Settings_Config_Aggregate;
  /** fetch data from the table: "settings.config" using primary key columns */
  settings_config_by_pk?: Maybe<Settings_Config>;
  /** fetch data from the table in a streaming manner: "settings.config" */
  settings_config_stream: Array<Settings_Config>;
  /** fetch data from the table: "user.account" */
  user_account: Array<User_Account>;
  /** fetch aggregated fields from the table: "user.account" */
  user_account_aggregate: User_Account_Aggregate;
  /** fetch data from the table: "user.account" using primary key columns */
  user_account_by_pk?: Maybe<User_Account>;
  /** fetch data from the table in a streaming manner: "user.account" */
  user_account_stream: Array<User_Account>;
  /** fetch data from the table: "user.otp_rate_limit" */
  user_otp_rate_limit: Array<User_Otp_Rate_Limit>;
  /** fetch aggregated fields from the table: "user.otp_rate_limit" */
  user_otp_rate_limit_aggregate: User_Otp_Rate_Limit_Aggregate;
  /** fetch data from the table: "user.otp_rate_limit" using primary key columns */
  user_otp_rate_limit_by_pk?: Maybe<User_Otp_Rate_Limit>;
  /** fetch data from the table in a streaming manner: "user.otp_rate_limit" */
  user_otp_rate_limit_stream: Array<User_Otp_Rate_Limit>;
  /** fetch data from the table: "user.otp_transaction" */
  user_otp_transaction: Array<User_Otp_Transaction>;
  /** fetch aggregated fields from the table: "user.otp_transaction" */
  user_otp_transaction_aggregate: User_Otp_Transaction_Aggregate;
  /** fetch data from the table: "user.otp_transaction" using primary key columns */
  user_otp_transaction_by_pk?: Maybe<User_Otp_Transaction>;
  /** fetch data from the table in a streaming manner: "user.otp_transaction" */
  user_otp_transaction_stream: Array<User_Otp_Transaction>;
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
  /** fetch data from the table in a streaming manner: "user.session" */
  user_session_stream: Array<User_Session>;
};


export type Subscription_RootSettings_ConfigArgs = {
  distinct_on?: InputMaybe<Array<Settings_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Settings_Config_Order_By>>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};


export type Subscription_RootSettings_Config_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Settings_Config_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Settings_Config_Order_By>>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};


export type Subscription_RootSettings_Config_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootSettings_Config_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Settings_Config_Stream_Cursor_Input>>;
  where?: InputMaybe<Settings_Config_Bool_Exp>;
};


export type Subscription_RootUser_AccountArgs = {
  distinct_on?: InputMaybe<Array<User_Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Account_Order_By>>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};


export type Subscription_RootUser_Account_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Account_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Account_Order_By>>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};


export type Subscription_RootUser_Account_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Account_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Account_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};


export type Subscription_RootUser_Otp_Rate_LimitArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Rate_Limit_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Rate_Limit_Order_By>>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};


export type Subscription_RootUser_Otp_Rate_Limit_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Rate_Limit_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Rate_Limit_Order_By>>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};


export type Subscription_RootUser_Otp_Rate_Limit_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Otp_Rate_Limit_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Otp_Rate_Limit_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};


export type Subscription_RootUser_Otp_TransactionArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Transaction_Order_By>>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
};


export type Subscription_RootUser_Otp_Transaction_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Otp_Transaction_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Otp_Transaction_Order_By>>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
};


export type Subscription_RootUser_Otp_Transaction_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Otp_Transaction_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Otp_Transaction_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
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

/** columns and relationships of "user.account" */
export type User_Account = {
  __typename?: 'user_account';
  created_at: Scalars['timestamptz']['output'];
  email?: Maybe<Scalars['String']['output']>;
  email_verfied_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  password: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  phone_verified_at?: Maybe<Scalars['timestamptz']['output']>;
  role: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "user.account" */
export type User_Account_Aggregate = {
  __typename?: 'user_account_aggregate';
  aggregate?: Maybe<User_Account_Aggregate_Fields>;
  nodes: Array<User_Account>;
};

/** aggregate fields of "user.account" */
export type User_Account_Aggregate_Fields = {
  __typename?: 'user_account_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Account_Max_Fields>;
  min?: Maybe<User_Account_Min_Fields>;
};


/** aggregate fields of "user.account" */
export type User_Account_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Account_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "user.account". All fields are combined with a logical 'AND'. */
export type User_Account_Bool_Exp = {
  _and?: InputMaybe<Array<User_Account_Bool_Exp>>;
  _not?: InputMaybe<User_Account_Bool_Exp>;
  _or?: InputMaybe<Array<User_Account_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  email_verfied_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  password?: InputMaybe<String_Comparison_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  phone_verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.account" */
export enum User_Account_Constraint {
  /** unique or primary key constraint on columns "phone" */
  AccountPhoneKey = 'account_phone_key',
  /** unique or primary key constraint on columns "id" */
  AccountPkey = 'account_pkey'
}

/** input type for inserting data into table "user.account" */
export type User_Account_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_verfied_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  phone_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type User_Account_Max_Fields = {
  __typename?: 'user_account_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  email_verfied_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  phone_verified_at?: Maybe<Scalars['timestamptz']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type User_Account_Min_Fields = {
  __typename?: 'user_account_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  email_verfied_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  phone_verified_at?: Maybe<Scalars['timestamptz']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "user.account" */
export type User_Account_Mutation_Response = {
  __typename?: 'user_account_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Account>;
};

/** on_conflict condition type for table "user.account" */
export type User_Account_On_Conflict = {
  constraint: User_Account_Constraint;
  update_columns?: Array<User_Account_Update_Column>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};

/** Ordering options when selecting data from "user.account". */
export type User_Account_Order_By = {
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  email_verfied_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  phone?: InputMaybe<Order_By>;
  phone_verified_at?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.account */
export type User_Account_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user.account" */
export enum User_Account_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerfiedAt = 'email_verfied_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Password = 'password',
  /** column name */
  Phone = 'phone',
  /** column name */
  PhoneVerifiedAt = 'phone_verified_at',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "user.account" */
export type User_Account_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_verfied_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  phone_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "user_account" */
export type User_Account_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Account_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Account_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_verfied_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  phone_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "user.account" */
export enum User_Account_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerfiedAt = 'email_verfied_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Password = 'password',
  /** column name */
  Phone = 'phone',
  /** column name */
  PhoneVerifiedAt = 'phone_verified_at',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type User_Account_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Account_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Account_Bool_Exp;
};

/** Tracks rate limits for OTP operations */
export type User_Otp_Rate_Limit = {
  __typename?: 'user_otp_rate_limit';
  action_type: Scalars['String']['output'];
  attempt_count: Scalars['Int']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  identifier: Scalars['String']['output'];
  identifier_type: Scalars['String']['output'];
  ip_address: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  window_start: Scalars['timestamptz']['output'];
};

/** aggregated selection of "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Aggregate = {
  __typename?: 'user_otp_rate_limit_aggregate';
  aggregate?: Maybe<User_Otp_Rate_Limit_Aggregate_Fields>;
  nodes: Array<User_Otp_Rate_Limit>;
};

/** aggregate fields of "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Aggregate_Fields = {
  __typename?: 'user_otp_rate_limit_aggregate_fields';
  avg?: Maybe<User_Otp_Rate_Limit_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Otp_Rate_Limit_Max_Fields>;
  min?: Maybe<User_Otp_Rate_Limit_Min_Fields>;
  stddev?: Maybe<User_Otp_Rate_Limit_Stddev_Fields>;
  stddev_pop?: Maybe<User_Otp_Rate_Limit_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Otp_Rate_Limit_Stddev_Samp_Fields>;
  sum?: Maybe<User_Otp_Rate_Limit_Sum_Fields>;
  var_pop?: Maybe<User_Otp_Rate_Limit_Var_Pop_Fields>;
  var_samp?: Maybe<User_Otp_Rate_Limit_Var_Samp_Fields>;
  variance?: Maybe<User_Otp_Rate_Limit_Variance_Fields>;
};


/** aggregate fields of "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Otp_Rate_Limit_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Otp_Rate_Limit_Avg_Fields = {
  __typename?: 'user_otp_rate_limit_avg_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user.otp_rate_limit". All fields are combined with a logical 'AND'. */
export type User_Otp_Rate_Limit_Bool_Exp = {
  _and?: InputMaybe<Array<User_Otp_Rate_Limit_Bool_Exp>>;
  _not?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
  _or?: InputMaybe<Array<User_Otp_Rate_Limit_Bool_Exp>>;
  action_type?: InputMaybe<String_Comparison_Exp>;
  attempt_count?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  identifier?: InputMaybe<String_Comparison_Exp>;
  identifier_type?: InputMaybe<String_Comparison_Exp>;
  ip_address?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  window_start?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.otp_rate_limit" */
export enum User_Otp_Rate_Limit_Constraint {
  /** unique or primary key constraint on columns "identifier", "action_type", "window_start" */
  OtpRateLimitIdentifierActionTypeWindowStartKey = 'otp_rate_limit_identifier_action_type_window_start_key',
  /** unique or primary key constraint on columns "id" */
  OtpRateLimitPkey = 'otp_rate_limit_pkey'
}

/** input type for incrementing numeric columns in table "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Inc_Input = {
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Insert_Input = {
  action_type?: InputMaybe<Scalars['String']['input']>;
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  window_start?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type User_Otp_Rate_Limit_Max_Fields = {
  __typename?: 'user_otp_rate_limit_max_fields';
  action_type?: Maybe<Scalars['String']['output']>;
  attempt_count?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  identifier_type?: Maybe<Scalars['String']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  window_start?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type User_Otp_Rate_Limit_Min_Fields = {
  __typename?: 'user_otp_rate_limit_min_fields';
  action_type?: Maybe<Scalars['String']['output']>;
  attempt_count?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  identifier_type?: Maybe<Scalars['String']['output']>;
  ip_address?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  window_start?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Mutation_Response = {
  __typename?: 'user_otp_rate_limit_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Otp_Rate_Limit>;
};

/** on_conflict condition type for table "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_On_Conflict = {
  constraint: User_Otp_Rate_Limit_Constraint;
  update_columns?: Array<User_Otp_Rate_Limit_Update_Column>;
  where?: InputMaybe<User_Otp_Rate_Limit_Bool_Exp>;
};

/** Ordering options when selecting data from "user.otp_rate_limit". */
export type User_Otp_Rate_Limit_Order_By = {
  action_type?: InputMaybe<Order_By>;
  attempt_count?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  identifier?: InputMaybe<Order_By>;
  identifier_type?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  window_start?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.otp_rate_limit */
export type User_Otp_Rate_Limit_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user.otp_rate_limit" */
export enum User_Otp_Rate_Limit_Select_Column {
  /** column name */
  ActionType = 'action_type',
  /** column name */
  AttemptCount = 'attempt_count',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  IdentifierType = 'identifier_type',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  WindowStart = 'window_start'
}

/** input type for updating data in table "user.otp_rate_limit" */
export type User_Otp_Rate_Limit_Set_Input = {
  action_type?: InputMaybe<Scalars['String']['input']>;
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  window_start?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type User_Otp_Rate_Limit_Stddev_Fields = {
  __typename?: 'user_otp_rate_limit_stddev_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Otp_Rate_Limit_Stddev_Pop_Fields = {
  __typename?: 'user_otp_rate_limit_stddev_pop_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Otp_Rate_Limit_Stddev_Samp_Fields = {
  __typename?: 'user_otp_rate_limit_stddev_samp_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_otp_rate_limit" */
export type User_Otp_Rate_Limit_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Otp_Rate_Limit_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Otp_Rate_Limit_Stream_Cursor_Value_Input = {
  action_type?: InputMaybe<Scalars['String']['input']>;
  attempt_count?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  window_start?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type User_Otp_Rate_Limit_Sum_Fields = {
  __typename?: 'user_otp_rate_limit_sum_fields';
  attempt_count?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user.otp_rate_limit" */
export enum User_Otp_Rate_Limit_Update_Column {
  /** column name */
  ActionType = 'action_type',
  /** column name */
  AttemptCount = 'attempt_count',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  IdentifierType = 'identifier_type',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  WindowStart = 'window_start'
}

export type User_Otp_Rate_Limit_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Otp_Rate_Limit_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Otp_Rate_Limit_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Otp_Rate_Limit_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Otp_Rate_Limit_Var_Pop_Fields = {
  __typename?: 'user_otp_rate_limit_var_pop_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Otp_Rate_Limit_Var_Samp_Fields = {
  __typename?: 'user_otp_rate_limit_var_samp_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Otp_Rate_Limit_Variance_Fields = {
  __typename?: 'user_otp_rate_limit_variance_fields';
  attempt_count?: Maybe<Scalars['Float']['output']>;
};

/** Stores OTP codes for authentication flows */
export type User_Otp_Transaction = {
  __typename?: 'user_otp_transaction';
  attempts: Scalars['Int']['output'];
  created_at: Scalars['timestamptz']['output'];
  expires_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  identifier: Scalars['String']['output'];
  identifier_type: Scalars['String']['output'];
  otp_hash: Scalars['String']['output'];
  purpose: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  verified: Scalars['Boolean']['output'];
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregated selection of "user.otp_transaction" */
export type User_Otp_Transaction_Aggregate = {
  __typename?: 'user_otp_transaction_aggregate';
  aggregate?: Maybe<User_Otp_Transaction_Aggregate_Fields>;
  nodes: Array<User_Otp_Transaction>;
};

/** aggregate fields of "user.otp_transaction" */
export type User_Otp_Transaction_Aggregate_Fields = {
  __typename?: 'user_otp_transaction_aggregate_fields';
  avg?: Maybe<User_Otp_Transaction_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Otp_Transaction_Max_Fields>;
  min?: Maybe<User_Otp_Transaction_Min_Fields>;
  stddev?: Maybe<User_Otp_Transaction_Stddev_Fields>;
  stddev_pop?: Maybe<User_Otp_Transaction_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Otp_Transaction_Stddev_Samp_Fields>;
  sum?: Maybe<User_Otp_Transaction_Sum_Fields>;
  var_pop?: Maybe<User_Otp_Transaction_Var_Pop_Fields>;
  var_samp?: Maybe<User_Otp_Transaction_Var_Samp_Fields>;
  variance?: Maybe<User_Otp_Transaction_Variance_Fields>;
};


/** aggregate fields of "user.otp_transaction" */
export type User_Otp_Transaction_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Otp_Transaction_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Otp_Transaction_Avg_Fields = {
  __typename?: 'user_otp_transaction_avg_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user.otp_transaction". All fields are combined with a logical 'AND'. */
export type User_Otp_Transaction_Bool_Exp = {
  _and?: InputMaybe<Array<User_Otp_Transaction_Bool_Exp>>;
  _not?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
  _or?: InputMaybe<Array<User_Otp_Transaction_Bool_Exp>>;
  attempts?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  identifier?: InputMaybe<String_Comparison_Exp>;
  identifier_type?: InputMaybe<String_Comparison_Exp>;
  otp_hash?: InputMaybe<String_Comparison_Exp>;
  purpose?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  verified?: InputMaybe<Boolean_Comparison_Exp>;
  verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.otp_transaction" */
export enum User_Otp_Transaction_Constraint {
  /** unique or primary key constraint on columns "identifier", "purpose", "expires_at", "verified" */
  IdxOtpIdentifierPurpose = 'idx_otp_identifier_purpose',
  /** unique or primary key constraint on columns "id" */
  OtpTransactionPkey = 'otp_transaction_pkey'
}

/** input type for incrementing numeric columns in table "user.otp_transaction" */
export type User_Otp_Transaction_Inc_Input = {
  attempts?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user.otp_transaction" */
export type User_Otp_Transaction_Insert_Input = {
  attempts?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  otp_hash?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type User_Otp_Transaction_Max_Fields = {
  __typename?: 'user_otp_transaction_max_fields';
  attempts?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  identifier_type?: Maybe<Scalars['String']['output']>;
  otp_hash?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type User_Otp_Transaction_Min_Fields = {
  __typename?: 'user_otp_transaction_min_fields';
  attempts?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  expires_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  identifier_type?: Maybe<Scalars['String']['output']>;
  otp_hash?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  verified_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "user.otp_transaction" */
export type User_Otp_Transaction_Mutation_Response = {
  __typename?: 'user_otp_transaction_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Otp_Transaction>;
};

/** on_conflict condition type for table "user.otp_transaction" */
export type User_Otp_Transaction_On_Conflict = {
  constraint: User_Otp_Transaction_Constraint;
  update_columns?: Array<User_Otp_Transaction_Update_Column>;
  where?: InputMaybe<User_Otp_Transaction_Bool_Exp>;
};

/** Ordering options when selecting data from "user.otp_transaction". */
export type User_Otp_Transaction_Order_By = {
  attempts?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  identifier?: InputMaybe<Order_By>;
  identifier_type?: InputMaybe<Order_By>;
  otp_hash?: InputMaybe<Order_By>;
  purpose?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  verified?: InputMaybe<Order_By>;
  verified_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.otp_transaction */
export type User_Otp_Transaction_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user.otp_transaction" */
export enum User_Otp_Transaction_Select_Column {
  /** column name */
  Attempts = 'attempts',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  IdentifierType = 'identifier_type',
  /** column name */
  OtpHash = 'otp_hash',
  /** column name */
  Purpose = 'purpose',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Verified = 'verified',
  /** column name */
  VerifiedAt = 'verified_at'
}

/** input type for updating data in table "user.otp_transaction" */
export type User_Otp_Transaction_Set_Input = {
  attempts?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  otp_hash?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type User_Otp_Transaction_Stddev_Fields = {
  __typename?: 'user_otp_transaction_stddev_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Otp_Transaction_Stddev_Pop_Fields = {
  __typename?: 'user_otp_transaction_stddev_pop_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Otp_Transaction_Stddev_Samp_Fields = {
  __typename?: 'user_otp_transaction_stddev_samp_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_otp_transaction" */
export type User_Otp_Transaction_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Otp_Transaction_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Otp_Transaction_Stream_Cursor_Value_Input = {
  attempts?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  identifier_type?: InputMaybe<Scalars['String']['input']>;
  otp_hash?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
  verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type User_Otp_Transaction_Sum_Fields = {
  __typename?: 'user_otp_transaction_sum_fields';
  attempts?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user.otp_transaction" */
export enum User_Otp_Transaction_Update_Column {
  /** column name */
  Attempts = 'attempts',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  IdentifierType = 'identifier_type',
  /** column name */
  OtpHash = 'otp_hash',
  /** column name */
  Purpose = 'purpose',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Verified = 'verified',
  /** column name */
  VerifiedAt = 'verified_at'
}

export type User_Otp_Transaction_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Otp_Transaction_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Otp_Transaction_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Otp_Transaction_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Otp_Transaction_Var_Pop_Fields = {
  __typename?: 'user_otp_transaction_var_pop_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Otp_Transaction_Var_Samp_Fields = {
  __typename?: 'user_otp_transaction_var_samp_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Otp_Transaction_Variance_Fields = {
  __typename?: 'user_otp_transaction_variance_fields';
  attempts?: Maybe<Scalars['Float']['output']>;
};

/** This will store user sessions  */
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
  user_id?: Maybe<Scalars['uuid']['output']>;
};


/** This will store user sessions  */
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
  count: Scalars['Int']['output'];
  max?: Maybe<User_Session_Max_Fields>;
  min?: Maybe<User_Session_Min_Fields>;
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
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
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
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<User_Session_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Session_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Session_Bool_Exp;
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

export type InsertSessionMutationVariables = Exact<{
  session: User_Session_Insert_Input;
}>;


export type InsertSessionMutation = { __typename?: 'mutation_root', insert_user_session_one?: { __typename?: 'user_session', id: string, user_id?: string | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type UpdateSessionMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  session: User_Session_Set_Input;
}>;


export type UpdateSessionMutation = { __typename?: 'mutation_root', update_user_session_by_pk?: { __typename?: 'user_session', id: string, user_id?: string | null, access_token: string, access_token_expires_at: string, refresh_token: string, refresh_token_expires_at: string, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: string, created_at: string, updated_at: string } | null };

export type InsertUserMutationVariables = Exact<{
  object: User_Account_Insert_Input;
}>;


export type InsertUserMutation = { __typename?: 'mutation_root', insert_user_account_one?: { __typename?: 'user_account', id: string, phone: string, email?: string | null, role: string, phone_verified_at?: string | null, is_active: boolean, created_at: string, updated_at: string } | null };

export type UpdateUserVerifiedMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type UpdateUserVerifiedMutation = { __typename?: 'mutation_root', update_user_account_by_pk?: { __typename?: 'user_account', id: string, phone_verified_at?: string | null } | null };

export type UpdateUserPasswordMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  password: Scalars['String']['input'];
}>;


export type UpdateUserPasswordMutation = { __typename?: 'mutation_root', update_user_account_by_pk?: { __typename?: 'user_account', id: string } | null };

export type RevokeUserSessionsMutationVariables = Exact<{
  user_id: Scalars['uuid']['input'];
}>;


export type RevokeUserSessionsMutation = { __typename?: 'mutation_root', update_user_session?: { __typename?: 'user_session_mutation_response', affected_rows: number } | null };


export const InsertSessionDocument = gql`
    mutation InsertSession($session: user_session_insert_input!) {
  insert_user_session_one(object: $session) {
    id
    user_id
    access_token
    access_token_expires_at
    refresh_token
    refresh_token_expires_at
    revoked
    ip_address
    device_info
    user_agent
    last_used_at
    created_at
    updated_at
  }
}
    `;
export const UpdateSessionDocument = gql`
    mutation UpdateSession($id: uuid!, $session: user_session_set_input!) {
  update_user_session_by_pk(pk_columns: {id: $id}, _set: $session) {
    id
    user_id
    access_token
    access_token_expires_at
    refresh_token
    refresh_token_expires_at
    revoked
    ip_address
    device_info
    user_agent
    last_used_at
    created_at
    updated_at
  }
}
    `;
export const InsertUserDocument = gql`
    mutation InsertUser($object: user_account_insert_input!) {
  insert_user_account_one(object: $object) {
    id
    phone
    email
    role
    phone_verified_at
    is_active
    created_at
    updated_at
  }
}
    `;
export const UpdateUserVerifiedDocument = gql`
    mutation UpdateUserVerified($id: uuid!) {
  update_user_account_by_pk(
    pk_columns: {id: $id}
    _set: {phone_verified_at: "now()"}
  ) {
    id
    phone_verified_at
  }
}
    `;
export const UpdateUserPasswordDocument = gql`
    mutation UpdateUserPassword($id: uuid!, $password: String!) {
  update_user_account_by_pk(pk_columns: {id: $id}, _set: {password: $password}) {
    id
  }
}
    `;
export const RevokeUserSessionsDocument = gql`
    mutation RevokeUserSessions($user_id: uuid!) {
  update_user_session(
    where: {user_id: {_eq: $user_id}, revoked: {_eq: false}}
    _set: {revoked: true}
  ) {
    affected_rows
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    InsertSession(variables: InsertSessionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<InsertSessionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InsertSessionMutation>({ document: InsertSessionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertSession', 'mutation', variables);
    },
    UpdateSession(variables: UpdateSessionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateSessionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSessionMutation>({ document: UpdateSessionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateSession', 'mutation', variables);
    },
    InsertUser(variables: InsertUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<InsertUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<InsertUserMutation>({ document: InsertUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'InsertUser', 'mutation', variables);
    },
    UpdateUserVerified(variables: UpdateUserVerifiedMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateUserVerifiedMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserVerifiedMutation>({ document: UpdateUserVerifiedDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateUserVerified', 'mutation', variables);
    },
    UpdateUserPassword(variables: UpdateUserPasswordMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateUserPasswordMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserPasswordMutation>({ document: UpdateUserPasswordDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateUserPassword', 'mutation', variables);
    },
    RevokeUserSessions(variables: RevokeUserSessionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RevokeUserSessionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RevokeUserSessionsMutation>({ document: RevokeUserSessionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RevokeUserSessions', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;