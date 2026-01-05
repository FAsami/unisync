import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  date: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  numeric: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
  timetz: { input: any; output: any; }
  uuid: { input: any; output: any; }
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

/** columns and relationships of "academic.batch" */
export type Academic_Batch = {
  __typename?: 'academic_batch';
  /** An array relationship */
  class_representatives: Array<Academic_Class_Representative>;
  /** An aggregate relationship */
  class_representatives_aggregate: Academic_Class_Representative_Aggregate;
  /** An array relationship */
  course_offerings: Array<Academic_Course_Offering>;
  /** An aggregate relationship */
  course_offerings_aggregate: Academic_Course_Offering_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  current_semester: Scalars['Int']['output'];
  departmant_id: Scalars['uuid']['output'];
  /** An object relationship */
  department: Academic_Department;
  end_date?: Maybe<Scalars['date']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** An array relationship */
  sections: Array<Academic_Section>;
  /** An aggregate relationship */
  sections_aggregate: Academic_Section_Aggregate;
  semester_count: Scalars['Int']['output'];
  start_date?: Maybe<Scalars['date']['output']>;
  updated_at: Scalars['timestamptz']['output'];
  year: Scalars['Int']['output'];
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchClass_RepresentativesArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchClass_Representatives_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchCourse_OfferingsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchCourse_Offerings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchSectionsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


/** columns and relationships of "academic.batch" */
export type Academic_BatchSections_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};

/** aggregated selection of "academic.batch" */
export type Academic_Batch_Aggregate = {
  __typename?: 'academic_batch_aggregate';
  aggregate?: Maybe<Academic_Batch_Aggregate_Fields>;
  nodes: Array<Academic_Batch>;
};

export type Academic_Batch_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Batch_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Batch_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Batch_Aggregate_Bool_Exp_Count>;
};

export type Academic_Batch_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Batch_Select_Column_Academic_Batch_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Batch_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Batch_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Batch_Select_Column_Academic_Batch_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Batch_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Batch_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Batch_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.batch" */
export type Academic_Batch_Aggregate_Fields = {
  __typename?: 'academic_batch_aggregate_fields';
  avg?: Maybe<Academic_Batch_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Batch_Max_Fields>;
  min?: Maybe<Academic_Batch_Min_Fields>;
  stddev?: Maybe<Academic_Batch_Stddev_Fields>;
  stddev_pop?: Maybe<Academic_Batch_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Academic_Batch_Stddev_Samp_Fields>;
  sum?: Maybe<Academic_Batch_Sum_Fields>;
  var_pop?: Maybe<Academic_Batch_Var_Pop_Fields>;
  var_samp?: Maybe<Academic_Batch_Var_Samp_Fields>;
  variance?: Maybe<Academic_Batch_Variance_Fields>;
};


/** aggregate fields of "academic.batch" */
export type Academic_Batch_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.batch" */
export type Academic_Batch_Aggregate_Order_By = {
  avg?: InputMaybe<Academic_Batch_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Batch_Max_Order_By>;
  min?: InputMaybe<Academic_Batch_Min_Order_By>;
  stddev?: InputMaybe<Academic_Batch_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Academic_Batch_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Academic_Batch_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Academic_Batch_Sum_Order_By>;
  var_pop?: InputMaybe<Academic_Batch_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Academic_Batch_Var_Samp_Order_By>;
  variance?: InputMaybe<Academic_Batch_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "academic.batch" */
export type Academic_Batch_Arr_Rel_Insert_Input = {
  data: Array<Academic_Batch_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Batch_On_Conflict>;
};

/** aggregate avg on columns */
export type Academic_Batch_Avg_Fields = {
  __typename?: 'academic_batch_avg_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "academic.batch" */
export type Academic_Batch_Avg_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "academic.batch". All fields are combined with a logical 'AND'. */
export type Academic_Batch_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Batch_Bool_Exp>>;
  _not?: InputMaybe<Academic_Batch_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Batch_Bool_Exp>>;
  class_representatives?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  current_semester?: InputMaybe<Int_Comparison_Exp>;
  departmant_id?: InputMaybe<Uuid_Comparison_Exp>;
  department?: InputMaybe<Academic_Department_Bool_Exp>;
  end_date?: InputMaybe<Date_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  sections?: InputMaybe<Academic_Section_Bool_Exp>;
  sections_aggregate?: InputMaybe<Academic_Section_Aggregate_Bool_Exp>;
  semester_count?: InputMaybe<Int_Comparison_Exp>;
  start_date?: InputMaybe<Date_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  year?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.batch" */
export enum Academic_Batch_Constraint {
  /** unique or primary key constraint on columns "id" */
  BatchPkey = 'batch_pkey'
}

/** input type for incrementing numeric columns in table "academic.batch" */
export type Academic_Batch_Inc_Input = {
  current_semester?: InputMaybe<Scalars['Int']['input']>;
  semester_count?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "academic.batch" */
export type Academic_Batch_Insert_Input = {
  class_representatives?: InputMaybe<Academic_Class_Representative_Arr_Rel_Insert_Input>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  current_semester?: InputMaybe<Scalars['Int']['input']>;
  departmant_id?: InputMaybe<Scalars['uuid']['input']>;
  department?: InputMaybe<Academic_Department_Obj_Rel_Insert_Input>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sections?: InputMaybe<Academic_Section_Arr_Rel_Insert_Input>;
  semester_count?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Academic_Batch_Max_Fields = {
  __typename?: 'academic_batch_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  current_semester?: Maybe<Scalars['Int']['output']>;
  departmant_id?: Maybe<Scalars['uuid']['output']>;
  end_date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  semester_count?: Maybe<Scalars['Int']['output']>;
  start_date?: Maybe<Scalars['date']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "academic.batch" */
export type Academic_Batch_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  current_semester?: InputMaybe<Order_By>;
  departmant_id?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Batch_Min_Fields = {
  __typename?: 'academic_batch_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  current_semester?: Maybe<Scalars['Int']['output']>;
  departmant_id?: Maybe<Scalars['uuid']['output']>;
  end_date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  semester_count?: Maybe<Scalars['Int']['output']>;
  start_date?: Maybe<Scalars['date']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "academic.batch" */
export type Academic_Batch_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  current_semester?: InputMaybe<Order_By>;
  departmant_id?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.batch" */
export type Academic_Batch_Mutation_Response = {
  __typename?: 'academic_batch_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Batch>;
};

/** input type for inserting object relation for remote table "academic.batch" */
export type Academic_Batch_Obj_Rel_Insert_Input = {
  data: Academic_Batch_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Batch_On_Conflict>;
};

/** on_conflict condition type for table "academic.batch" */
export type Academic_Batch_On_Conflict = {
  constraint: Academic_Batch_Constraint;
  update_columns?: Array<Academic_Batch_Update_Column>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.batch". */
export type Academic_Batch_Order_By = {
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Order_By>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  current_semester?: InputMaybe<Order_By>;
  departmant_id?: InputMaybe<Order_By>;
  department?: InputMaybe<Academic_Department_Order_By>;
  end_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  sections_aggregate?: InputMaybe<Academic_Section_Aggregate_Order_By>;
  semester_count?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.batch */
export type Academic_Batch_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.batch" */
export enum Academic_Batch_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrentSemester = 'current_semester',
  /** column name */
  DepartmantId = 'departmant_id',
  /** column name */
  EndDate = 'end_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  SemesterCount = 'semester_count',
  /** column name */
  StartDate = 'start_date',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Year = 'year'
}

/** select "academic_batch_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.batch" */
export enum Academic_Batch_Select_Column_Academic_Batch_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_batch_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.batch" */
export enum Academic_Batch_Select_Column_Academic_Batch_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.batch" */
export type Academic_Batch_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  current_semester?: InputMaybe<Scalars['Int']['input']>;
  departmant_id?: InputMaybe<Scalars['uuid']['input']>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester_count?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Academic_Batch_Stddev_Fields = {
  __typename?: 'academic_batch_stddev_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "academic.batch" */
export type Academic_Batch_Stddev_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Academic_Batch_Stddev_Pop_Fields = {
  __typename?: 'academic_batch_stddev_pop_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "academic.batch" */
export type Academic_Batch_Stddev_Pop_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Academic_Batch_Stddev_Samp_Fields = {
  __typename?: 'academic_batch_stddev_samp_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "academic.batch" */
export type Academic_Batch_Stddev_Samp_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "academic_batch" */
export type Academic_Batch_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Batch_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Batch_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  current_semester?: InputMaybe<Scalars['Int']['input']>;
  departmant_id?: InputMaybe<Scalars['uuid']['input']>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester_count?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Academic_Batch_Sum_Fields = {
  __typename?: 'academic_batch_sum_fields';
  current_semester?: Maybe<Scalars['Int']['output']>;
  semester_count?: Maybe<Scalars['Int']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "academic.batch" */
export type Academic_Batch_Sum_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** update columns of table "academic.batch" */
export enum Academic_Batch_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CurrentSemester = 'current_semester',
  /** column name */
  DepartmantId = 'departmant_id',
  /** column name */
  EndDate = 'end_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  SemesterCount = 'semester_count',
  /** column name */
  StartDate = 'start_date',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Year = 'year'
}

export type Academic_Batch_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Academic_Batch_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Batch_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Batch_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Academic_Batch_Var_Pop_Fields = {
  __typename?: 'academic_batch_var_pop_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "academic.batch" */
export type Academic_Batch_Var_Pop_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Academic_Batch_Var_Samp_Fields = {
  __typename?: 'academic_batch_var_samp_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "academic.batch" */
export type Academic_Batch_Var_Samp_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Academic_Batch_Variance_Fields = {
  __typename?: 'academic_batch_variance_fields';
  current_semester?: Maybe<Scalars['Float']['output']>;
  semester_count?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "academic.batch" */
export type Academic_Batch_Variance_Order_By = {
  current_semester?: InputMaybe<Order_By>;
  semester_count?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** columns and relationships of "academic.class_representative" */
export type Academic_Class_Representative = {
  __typename?: 'academic_class_representative';
  /** An object relationship */
  account: User_Account;
  appointed_at?: Maybe<Scalars['date']['output']>;
  /** An object relationship */
  batch: Academic_Batch;
  batch_id: Scalars['uuid']['output'];
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  /** An object relationship */
  section: Academic_Section;
  section_id: Scalars['uuid']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "academic.class_representative" */
export type Academic_Class_Representative_Aggregate = {
  __typename?: 'academic_class_representative_aggregate';
  aggregate?: Maybe<Academic_Class_Representative_Aggregate_Fields>;
  nodes: Array<Academic_Class_Representative>;
};

export type Academic_Class_Representative_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp_Count>;
};

export type Academic_Class_Representative_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Class_Representative_Select_Column_Academic_Class_Representative_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Class_Representative_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Class_Representative_Select_Column_Academic_Class_Representative_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Class_Representative_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.class_representative" */
export type Academic_Class_Representative_Aggregate_Fields = {
  __typename?: 'academic_class_representative_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Class_Representative_Max_Fields>;
  min?: Maybe<Academic_Class_Representative_Min_Fields>;
};


/** aggregate fields of "academic.class_representative" */
export type Academic_Class_Representative_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.class_representative" */
export type Academic_Class_Representative_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Class_Representative_Max_Order_By>;
  min?: InputMaybe<Academic_Class_Representative_Min_Order_By>;
};

/** input type for inserting array relation for remote table "academic.class_representative" */
export type Academic_Class_Representative_Arr_Rel_Insert_Input = {
  data: Array<Academic_Class_Representative_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Class_Representative_On_Conflict>;
};

/** Boolean expression to filter rows from the table "academic.class_representative". All fields are combined with a logical 'AND'. */
export type Academic_Class_Representative_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Class_Representative_Bool_Exp>>;
  _not?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Class_Representative_Bool_Exp>>;
  account?: InputMaybe<User_Account_Bool_Exp>;
  appointed_at?: InputMaybe<Date_Comparison_Exp>;
  batch?: InputMaybe<Academic_Batch_Bool_Exp>;
  batch_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  section?: InputMaybe<Academic_Section_Bool_Exp>;
  section_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.class_representative" */
export enum Academic_Class_Representative_Constraint {
  /** unique or primary key constraint on columns "id" */
  ClassRepresentativePkey = 'class_representative_pkey',
  /** unique or primary key constraint on columns "user_id", "section_id" */
  ClassRepresentativeUserIdSectionIdKey = 'class_representative_user_id_section_id_key'
}

/** input type for inserting data into table "academic.class_representative" */
export type Academic_Class_Representative_Insert_Input = {
  account?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
  appointed_at?: InputMaybe<Scalars['date']['input']>;
  batch?: InputMaybe<Academic_Batch_Obj_Rel_Insert_Input>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section?: InputMaybe<Academic_Section_Obj_Rel_Insert_Input>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Academic_Class_Representative_Max_Fields = {
  __typename?: 'academic_class_representative_max_fields';
  appointed_at?: Maybe<Scalars['date']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "academic.class_representative" */
export type Academic_Class_Representative_Max_Order_By = {
  appointed_at?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Class_Representative_Min_Fields = {
  __typename?: 'academic_class_representative_min_fields';
  appointed_at?: Maybe<Scalars['date']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "academic.class_representative" */
export type Academic_Class_Representative_Min_Order_By = {
  appointed_at?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.class_representative" */
export type Academic_Class_Representative_Mutation_Response = {
  __typename?: 'academic_class_representative_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Class_Representative>;
};

/** on_conflict condition type for table "academic.class_representative" */
export type Academic_Class_Representative_On_Conflict = {
  constraint: Academic_Class_Representative_Constraint;
  update_columns?: Array<Academic_Class_Representative_Update_Column>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.class_representative". */
export type Academic_Class_Representative_Order_By = {
  account?: InputMaybe<User_Account_Order_By>;
  appointed_at?: InputMaybe<Order_By>;
  batch?: InputMaybe<Academic_Batch_Order_By>;
  batch_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  section?: InputMaybe<Academic_Section_Order_By>;
  section_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.class_representative */
export type Academic_Class_Representative_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.class_representative" */
export enum Academic_Class_Representative_Select_Column {
  /** column name */
  AppointedAt = 'appointed_at',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** select "academic_class_representative_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.class_representative" */
export enum Academic_Class_Representative_Select_Column_Academic_Class_Representative_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_class_representative_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.class_representative" */
export enum Academic_Class_Representative_Select_Column_Academic_Class_Representative_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.class_representative" */
export type Academic_Class_Representative_Set_Input = {
  appointed_at?: InputMaybe<Scalars['date']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "academic_class_representative" */
export type Academic_Class_Representative_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Class_Representative_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Class_Representative_Stream_Cursor_Value_Input = {
  appointed_at?: InputMaybe<Scalars['date']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "academic.class_representative" */
export enum Academic_Class_Representative_Update_Column {
  /** column name */
  AppointedAt = 'appointed_at',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Academic_Class_Representative_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Class_Representative_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Class_Representative_Bool_Exp;
};

/** Course catelog */
export type Academic_Course = {
  __typename?: 'academic_course';
  code: Scalars['String']['output'];
  /** An array relationship */
  course_offerings: Array<Academic_Course_Offering>;
  /** An aggregate relationship */
  course_offerings_aggregate: Academic_Course_Offering_Aggregate;
  course_type: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  credit_hours: Scalars['numeric']['output'];
  /** An object relationship */
  department: Academic_Department;
  department_id: Scalars['uuid']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  semester: Scalars['Int']['output'];
  syllabus_url?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['timestamptz']['output'];
};


/** Course catelog */
export type Academic_CourseCourse_OfferingsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


/** Course catelog */
export type Academic_CourseCourse_Offerings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};

/** aggregated selection of "academic.course" */
export type Academic_Course_Aggregate = {
  __typename?: 'academic_course_aggregate';
  aggregate?: Maybe<Academic_Course_Aggregate_Fields>;
  nodes: Array<Academic_Course>;
};

export type Academic_Course_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Course_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Course_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Course_Aggregate_Bool_Exp_Count>;
};

export type Academic_Course_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Course_Select_Column_Academic_Course_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Course_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Course_Select_Column_Academic_Course_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Course_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Course_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.course" */
export type Academic_Course_Aggregate_Fields = {
  __typename?: 'academic_course_aggregate_fields';
  avg?: Maybe<Academic_Course_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Course_Max_Fields>;
  min?: Maybe<Academic_Course_Min_Fields>;
  stddev?: Maybe<Academic_Course_Stddev_Fields>;
  stddev_pop?: Maybe<Academic_Course_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Academic_Course_Stddev_Samp_Fields>;
  sum?: Maybe<Academic_Course_Sum_Fields>;
  var_pop?: Maybe<Academic_Course_Var_Pop_Fields>;
  var_samp?: Maybe<Academic_Course_Var_Samp_Fields>;
  variance?: Maybe<Academic_Course_Variance_Fields>;
};


/** aggregate fields of "academic.course" */
export type Academic_Course_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Course_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.course" */
export type Academic_Course_Aggregate_Order_By = {
  avg?: InputMaybe<Academic_Course_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Course_Max_Order_By>;
  min?: InputMaybe<Academic_Course_Min_Order_By>;
  stddev?: InputMaybe<Academic_Course_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Academic_Course_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Academic_Course_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Academic_Course_Sum_Order_By>;
  var_pop?: InputMaybe<Academic_Course_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Academic_Course_Var_Samp_Order_By>;
  variance?: InputMaybe<Academic_Course_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "academic.course" */
export type Academic_Course_Arr_Rel_Insert_Input = {
  data: Array<Academic_Course_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Course_On_Conflict>;
};

/** aggregate avg on columns */
export type Academic_Course_Avg_Fields = {
  __typename?: 'academic_course_avg_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "academic.course" */
export type Academic_Course_Avg_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "academic.course". All fields are combined with a logical 'AND'. */
export type Academic_Course_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Course_Bool_Exp>>;
  _not?: InputMaybe<Academic_Course_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Course_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp>;
  course_type?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  credit_hours?: InputMaybe<Numeric_Comparison_Exp>;
  department?: InputMaybe<Academic_Department_Bool_Exp>;
  department_id?: InputMaybe<Uuid_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  semester?: InputMaybe<Int_Comparison_Exp>;
  syllabus_url?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.course" */
export enum Academic_Course_Constraint {
  /** unique or primary key constraint on columns "department_id", "code" */
  CourseDepartmentIdCodeKey = 'course_department_id_code_key',
  /** unique or primary key constraint on columns "id" */
  CoursePkey = 'course_pkey'
}

/** input type for incrementing numeric columns in table "academic.course" */
export type Academic_Course_Inc_Input = {
  credit_hours?: InputMaybe<Scalars['numeric']['input']>;
  semester?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "academic.course" */
export type Academic_Course_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Arr_Rel_Insert_Input>;
  course_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  credit_hours?: InputMaybe<Scalars['numeric']['input']>;
  department?: InputMaybe<Academic_Department_Obj_Rel_Insert_Input>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester?: InputMaybe<Scalars['Int']['input']>;
  syllabus_url?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Academic_Course_Max_Fields = {
  __typename?: 'academic_course_max_fields';
  code?: Maybe<Scalars['String']['output']>;
  course_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  credit_hours?: Maybe<Scalars['numeric']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  semester?: Maybe<Scalars['Int']['output']>;
  syllabus_url?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "academic.course" */
export type Academic_Course_Max_Order_By = {
  code?: InputMaybe<Order_By>;
  course_type?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  credit_hours?: InputMaybe<Order_By>;
  department_id?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
  syllabus_url?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Course_Min_Fields = {
  __typename?: 'academic_course_min_fields';
  code?: Maybe<Scalars['String']['output']>;
  course_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  credit_hours?: Maybe<Scalars['numeric']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  semester?: Maybe<Scalars['Int']['output']>;
  syllabus_url?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "academic.course" */
export type Academic_Course_Min_Order_By = {
  code?: InputMaybe<Order_By>;
  course_type?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  credit_hours?: InputMaybe<Order_By>;
  department_id?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
  syllabus_url?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.course" */
export type Academic_Course_Mutation_Response = {
  __typename?: 'academic_course_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Course>;
};

/** input type for inserting object relation for remote table "academic.course" */
export type Academic_Course_Obj_Rel_Insert_Input = {
  data: Academic_Course_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Course_On_Conflict>;
};

/** Course instance for batched/sections */
export type Academic_Course_Offering = {
  __typename?: 'academic_course_offering';
  academic_year: Scalars['String']['output'];
  /** An object relationship */
  batch: Academic_Batch;
  batch_id: Scalars['uuid']['output'];
  /** An object relationship */
  course: Academic_Course;
  course_id: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  events: Array<Event_Event>;
  /** An aggregate relationship */
  events_aggregate: Event_Event_Aggregate;
  /** An object relationship */
  faculty?: Maybe<User_Faculty>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  /** An object relationship */
  section: Academic_Section;
  section_id: Scalars['uuid']['output'];
  teacher_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  user_enrollments: Array<Academic_User_Enrollment>;
  /** An aggregate relationship */
  user_enrollments_aggregate: Academic_User_Enrollment_Aggregate;
};


/** Course instance for batched/sections */
export type Academic_Course_OfferingEventsArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


/** Course instance for batched/sections */
export type Academic_Course_OfferingEvents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


/** Course instance for batched/sections */
export type Academic_Course_OfferingUser_EnrollmentsArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


/** Course instance for batched/sections */
export type Academic_Course_OfferingUser_Enrollments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};

/** aggregated selection of "academic.course_offering" */
export type Academic_Course_Offering_Aggregate = {
  __typename?: 'academic_course_offering_aggregate';
  aggregate?: Maybe<Academic_Course_Offering_Aggregate_Fields>;
  nodes: Array<Academic_Course_Offering>;
};

export type Academic_Course_Offering_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp_Count>;
};

export type Academic_Course_Offering_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Course_Offering_Select_Column_Academic_Course_Offering_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Course_Offering_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Course_Offering_Select_Column_Academic_Course_Offering_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Course_Offering_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.course_offering" */
export type Academic_Course_Offering_Aggregate_Fields = {
  __typename?: 'academic_course_offering_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Course_Offering_Max_Fields>;
  min?: Maybe<Academic_Course_Offering_Min_Fields>;
};


/** aggregate fields of "academic.course_offering" */
export type Academic_Course_Offering_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.course_offering" */
export type Academic_Course_Offering_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Course_Offering_Max_Order_By>;
  min?: InputMaybe<Academic_Course_Offering_Min_Order_By>;
};

/** input type for inserting array relation for remote table "academic.course_offering" */
export type Academic_Course_Offering_Arr_Rel_Insert_Input = {
  data: Array<Academic_Course_Offering_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Course_Offering_On_Conflict>;
};

/** Boolean expression to filter rows from the table "academic.course_offering". All fields are combined with a logical 'AND'. */
export type Academic_Course_Offering_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Course_Offering_Bool_Exp>>;
  _not?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Course_Offering_Bool_Exp>>;
  academic_year?: InputMaybe<String_Comparison_Exp>;
  batch?: InputMaybe<Academic_Batch_Bool_Exp>;
  batch_id?: InputMaybe<Uuid_Comparison_Exp>;
  course?: InputMaybe<Academic_Course_Bool_Exp>;
  course_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  events?: InputMaybe<Event_Event_Bool_Exp>;
  events_aggregate?: InputMaybe<Event_Event_Aggregate_Bool_Exp>;
  faculty?: InputMaybe<User_Faculty_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  section?: InputMaybe<Academic_Section_Bool_Exp>;
  section_id?: InputMaybe<Uuid_Comparison_Exp>;
  teacher_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_enrollments?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
  user_enrollments_aggregate?: InputMaybe<Academic_User_Enrollment_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "academic.course_offering" */
export enum Academic_Course_Offering_Constraint {
  /** unique or primary key constraint on columns "id" */
  CourseOfferingPkey = 'course_offering_pkey'
}

/** input type for inserting data into table "academic.course_offering" */
export type Academic_Course_Offering_Insert_Input = {
  academic_year?: InputMaybe<Scalars['String']['input']>;
  batch?: InputMaybe<Academic_Batch_Obj_Rel_Insert_Input>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  course?: InputMaybe<Academic_Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  events?: InputMaybe<Event_Event_Arr_Rel_Insert_Input>;
  faculty?: InputMaybe<User_Faculty_Obj_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section?: InputMaybe<Academic_Section_Obj_Rel_Insert_Input>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  teacher_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_enrollments?: InputMaybe<Academic_User_Enrollment_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Academic_Course_Offering_Max_Fields = {
  __typename?: 'academic_course_offering_max_fields';
  academic_year?: Maybe<Scalars['String']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  course_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  teacher_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "academic.course_offering" */
export type Academic_Course_Offering_Max_Order_By = {
  academic_year?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  teacher_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Course_Offering_Min_Fields = {
  __typename?: 'academic_course_offering_min_fields';
  academic_year?: Maybe<Scalars['String']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  course_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  teacher_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "academic.course_offering" */
export type Academic_Course_Offering_Min_Order_By = {
  academic_year?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  teacher_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.course_offering" */
export type Academic_Course_Offering_Mutation_Response = {
  __typename?: 'academic_course_offering_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Course_Offering>;
};

/** input type for inserting object relation for remote table "academic.course_offering" */
export type Academic_Course_Offering_Obj_Rel_Insert_Input = {
  data: Academic_Course_Offering_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Course_Offering_On_Conflict>;
};

/** on_conflict condition type for table "academic.course_offering" */
export type Academic_Course_Offering_On_Conflict = {
  constraint: Academic_Course_Offering_Constraint;
  update_columns?: Array<Academic_Course_Offering_Update_Column>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.course_offering". */
export type Academic_Course_Offering_Order_By = {
  academic_year?: InputMaybe<Order_By>;
  batch?: InputMaybe<Academic_Batch_Order_By>;
  batch_id?: InputMaybe<Order_By>;
  course?: InputMaybe<Academic_Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  events_aggregate?: InputMaybe<Event_Event_Aggregate_Order_By>;
  faculty?: InputMaybe<User_Faculty_Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  section?: InputMaybe<Academic_Section_Order_By>;
  section_id?: InputMaybe<Order_By>;
  teacher_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_enrollments_aggregate?: InputMaybe<Academic_User_Enrollment_Aggregate_Order_By>;
};

/** primary key columns input for table: academic.course_offering */
export type Academic_Course_Offering_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.course_offering" */
export enum Academic_Course_Offering_Select_Column {
  /** column name */
  AcademicYear = 'academic_year',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  TeacherId = 'teacher_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "academic_course_offering_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.course_offering" */
export enum Academic_Course_Offering_Select_Column_Academic_Course_Offering_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_course_offering_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.course_offering" */
export enum Academic_Course_Offering_Select_Column_Academic_Course_Offering_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.course_offering" */
export type Academic_Course_Offering_Set_Input = {
  academic_year?: InputMaybe<Scalars['String']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  course_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  teacher_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "academic_course_offering" */
export type Academic_Course_Offering_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Course_Offering_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Course_Offering_Stream_Cursor_Value_Input = {
  academic_year?: InputMaybe<Scalars['String']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  course_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  teacher_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "academic.course_offering" */
export enum Academic_Course_Offering_Update_Column {
  /** column name */
  AcademicYear = 'academic_year',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  TeacherId = 'teacher_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Academic_Course_Offering_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Course_Offering_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Course_Offering_Bool_Exp;
};

/** on_conflict condition type for table "academic.course" */
export type Academic_Course_On_Conflict = {
  constraint: Academic_Course_Constraint;
  update_columns?: Array<Academic_Course_Update_Column>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.course". */
export type Academic_Course_Order_By = {
  code?: InputMaybe<Order_By>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Order_By>;
  course_type?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  credit_hours?: InputMaybe<Order_By>;
  department?: InputMaybe<Academic_Department_Order_By>;
  department_id?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
  syllabus_url?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.course */
export type Academic_Course_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.course" */
export enum Academic_Course_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CourseType = 'course_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreditHours = 'credit_hours',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  Semester = 'semester',
  /** column name */
  SyllabusUrl = 'syllabus_url',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "academic_course_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.course" */
export enum Academic_Course_Select_Column_Academic_Course_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_course_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.course" */
export enum Academic_Course_Select_Column_Academic_Course_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.course" */
export type Academic_Course_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  course_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  credit_hours?: InputMaybe<Scalars['numeric']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester?: InputMaybe<Scalars['Int']['input']>;
  syllabus_url?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Academic_Course_Stddev_Fields = {
  __typename?: 'academic_course_stddev_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "academic.course" */
export type Academic_Course_Stddev_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Academic_Course_Stddev_Pop_Fields = {
  __typename?: 'academic_course_stddev_pop_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "academic.course" */
export type Academic_Course_Stddev_Pop_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Academic_Course_Stddev_Samp_Fields = {
  __typename?: 'academic_course_stddev_samp_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "academic.course" */
export type Academic_Course_Stddev_Samp_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "academic_course" */
export type Academic_Course_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Course_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Course_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  course_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  credit_hours?: InputMaybe<Scalars['numeric']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  semester?: InputMaybe<Scalars['Int']['input']>;
  syllabus_url?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Academic_Course_Sum_Fields = {
  __typename?: 'academic_course_sum_fields';
  credit_hours?: Maybe<Scalars['numeric']['output']>;
  semester?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "academic.course" */
export type Academic_Course_Sum_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** update columns of table "academic.course" */
export enum Academic_Course_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CourseType = 'course_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreditHours = 'credit_hours',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  Semester = 'semester',
  /** column name */
  SyllabusUrl = 'syllabus_url',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Academic_Course_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Academic_Course_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Course_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Course_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Academic_Course_Var_Pop_Fields = {
  __typename?: 'academic_course_var_pop_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "academic.course" */
export type Academic_Course_Var_Pop_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Academic_Course_Var_Samp_Fields = {
  __typename?: 'academic_course_var_samp_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "academic.course" */
export type Academic_Course_Var_Samp_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Academic_Course_Variance_Fields = {
  __typename?: 'academic_course_variance_fields';
  credit_hours?: Maybe<Scalars['Float']['output']>;
  semester?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "academic.course" */
export type Academic_Course_Variance_Order_By = {
  credit_hours?: InputMaybe<Order_By>;
  semester?: InputMaybe<Order_By>;
};

/** columns and relationships of "academic.department" */
export type Academic_Department = {
  __typename?: 'academic_department';
  /** An array relationship */
  batches: Array<Academic_Batch>;
  /** An aggregate relationship */
  batches_aggregate: Academic_Batch_Aggregate;
  code: Scalars['String']['output'];
  /** An array relationship */
  courses: Array<Academic_Course>;
  /** An aggregate relationship */
  courses_aggregate: Academic_Course_Aggregate;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  faculty?: Maybe<Academic_Faculty>;
  faculty_id?: Maybe<Scalars['uuid']['output']>;
  /** An object relationship */
  head_of_department?: Maybe<User_Account>;
  head_user_id?: Maybe<Scalars['uuid']['output']>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "academic.department" */
export type Academic_DepartmentBatchesArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


/** columns and relationships of "academic.department" */
export type Academic_DepartmentBatches_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


/** columns and relationships of "academic.department" */
export type Academic_DepartmentCoursesArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


/** columns and relationships of "academic.department" */
export type Academic_DepartmentCourses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};

/** aggregated selection of "academic.department" */
export type Academic_Department_Aggregate = {
  __typename?: 'academic_department_aggregate';
  aggregate?: Maybe<Academic_Department_Aggregate_Fields>;
  nodes: Array<Academic_Department>;
};

export type Academic_Department_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Department_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Department_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Department_Aggregate_Bool_Exp_Count>;
};

export type Academic_Department_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Department_Select_Column_Academic_Department_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Department_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Department_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Department_Select_Column_Academic_Department_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Department_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Department_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Department_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Department_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.department" */
export type Academic_Department_Aggregate_Fields = {
  __typename?: 'academic_department_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Department_Max_Fields>;
  min?: Maybe<Academic_Department_Min_Fields>;
};


/** aggregate fields of "academic.department" */
export type Academic_Department_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Department_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.department" */
export type Academic_Department_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Department_Max_Order_By>;
  min?: InputMaybe<Academic_Department_Min_Order_By>;
};

/** input type for inserting array relation for remote table "academic.department" */
export type Academic_Department_Arr_Rel_Insert_Input = {
  data: Array<Academic_Department_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Department_On_Conflict>;
};

/** Boolean expression to filter rows from the table "academic.department". All fields are combined with a logical 'AND'. */
export type Academic_Department_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Department_Bool_Exp>>;
  _not?: InputMaybe<Academic_Department_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Department_Bool_Exp>>;
  batches?: InputMaybe<Academic_Batch_Bool_Exp>;
  batches_aggregate?: InputMaybe<Academic_Batch_Aggregate_Bool_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  courses?: InputMaybe<Academic_Course_Bool_Exp>;
  courses_aggregate?: InputMaybe<Academic_Course_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  faculty?: InputMaybe<Academic_Faculty_Bool_Exp>;
  faculty_id?: InputMaybe<Uuid_Comparison_Exp>;
  head_of_department?: InputMaybe<User_Account_Bool_Exp>;
  head_user_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.department" */
export enum Academic_Department_Constraint {
  /** unique or primary key constraint on columns "code" */
  DepartmentCodeKey = 'department_code_key',
  /** unique or primary key constraint on columns "id" */
  DepartmentPkey = 'department_pkey'
}

/** input type for inserting data into table "academic.department" */
export type Academic_Department_Insert_Input = {
  batches?: InputMaybe<Academic_Batch_Arr_Rel_Insert_Input>;
  code?: InputMaybe<Scalars['String']['input']>;
  courses?: InputMaybe<Academic_Course_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  faculty?: InputMaybe<Academic_Faculty_Obj_Rel_Insert_Input>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  head_of_department?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
  head_user_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Academic_Department_Max_Fields = {
  __typename?: 'academic_department_max_fields';
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  faculty_id?: Maybe<Scalars['uuid']['output']>;
  head_user_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "academic.department" */
export type Academic_Department_Max_Order_By = {
  code?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  faculty_id?: InputMaybe<Order_By>;
  head_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Department_Min_Fields = {
  __typename?: 'academic_department_min_fields';
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  faculty_id?: Maybe<Scalars['uuid']['output']>;
  head_user_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "academic.department" */
export type Academic_Department_Min_Order_By = {
  code?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  faculty_id?: InputMaybe<Order_By>;
  head_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.department" */
export type Academic_Department_Mutation_Response = {
  __typename?: 'academic_department_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Department>;
};

/** input type for inserting object relation for remote table "academic.department" */
export type Academic_Department_Obj_Rel_Insert_Input = {
  data: Academic_Department_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Department_On_Conflict>;
};

/** on_conflict condition type for table "academic.department" */
export type Academic_Department_On_Conflict = {
  constraint: Academic_Department_Constraint;
  update_columns?: Array<Academic_Department_Update_Column>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.department". */
export type Academic_Department_Order_By = {
  batches_aggregate?: InputMaybe<Academic_Batch_Aggregate_Order_By>;
  code?: InputMaybe<Order_By>;
  courses_aggregate?: InputMaybe<Academic_Course_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  faculty?: InputMaybe<Academic_Faculty_Order_By>;
  faculty_id?: InputMaybe<Order_By>;
  head_of_department?: InputMaybe<User_Account_Order_By>;
  head_user_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.department */
export type Academic_Department_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.department" */
export enum Academic_Department_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  FacultyId = 'faculty_id',
  /** column name */
  HeadUserId = 'head_user_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "academic_department_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.department" */
export enum Academic_Department_Select_Column_Academic_Department_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_department_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.department" */
export enum Academic_Department_Select_Column_Academic_Department_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.department" */
export type Academic_Department_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  head_user_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "academic_department" */
export type Academic_Department_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Department_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Department_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  head_user_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "academic.department" */
export enum Academic_Department_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  FacultyId = 'faculty_id',
  /** column name */
  HeadUserId = 'head_user_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Academic_Department_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Department_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Department_Bool_Exp;
};

/** columns and relationships of "academic.faculty" */
export type Academic_Faculty = {
  __typename?: 'academic_faculty';
  created_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  departments: Array<Academic_Department>;
  /** An aggregate relationship */
  departments_aggregate: Academic_Department_Aggregate;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** columns and relationships of "academic.faculty" */
export type Academic_FacultyDepartmentsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


/** columns and relationships of "academic.faculty" */
export type Academic_FacultyDepartments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};

/** aggregated selection of "academic.faculty" */
export type Academic_Faculty_Aggregate = {
  __typename?: 'academic_faculty_aggregate';
  aggregate?: Maybe<Academic_Faculty_Aggregate_Fields>;
  nodes: Array<Academic_Faculty>;
};

/** aggregate fields of "academic.faculty" */
export type Academic_Faculty_Aggregate_Fields = {
  __typename?: 'academic_faculty_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Faculty_Max_Fields>;
  min?: Maybe<Academic_Faculty_Min_Fields>;
};


/** aggregate fields of "academic.faculty" */
export type Academic_Faculty_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Faculty_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "academic.faculty". All fields are combined with a logical 'AND'. */
export type Academic_Faculty_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Faculty_Bool_Exp>>;
  _not?: InputMaybe<Academic_Faculty_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Faculty_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  departments?: InputMaybe<Academic_Department_Bool_Exp>;
  departments_aggregate?: InputMaybe<Academic_Department_Aggregate_Bool_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.faculty" */
export enum Academic_Faculty_Constraint {
  /** unique or primary key constraint on columns "id" */
  FacultyPkey = 'faculty_pkey'
}

/** input type for inserting data into table "academic.faculty" */
export type Academic_Faculty_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  departments?: InputMaybe<Academic_Department_Arr_Rel_Insert_Input>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Academic_Faculty_Max_Fields = {
  __typename?: 'academic_faculty_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Academic_Faculty_Min_Fields = {
  __typename?: 'academic_faculty_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "academic.faculty" */
export type Academic_Faculty_Mutation_Response = {
  __typename?: 'academic_faculty_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Faculty>;
};

/** input type for inserting object relation for remote table "academic.faculty" */
export type Academic_Faculty_Obj_Rel_Insert_Input = {
  data: Academic_Faculty_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Faculty_On_Conflict>;
};

/** on_conflict condition type for table "academic.faculty" */
export type Academic_Faculty_On_Conflict = {
  constraint: Academic_Faculty_Constraint;
  update_columns?: Array<Academic_Faculty_Update_Column>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.faculty". */
export type Academic_Faculty_Order_By = {
  created_at?: InputMaybe<Order_By>;
  departments_aggregate?: InputMaybe<Academic_Department_Aggregate_Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.faculty */
export type Academic_Faculty_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.faculty" */
export enum Academic_Faculty_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "academic.faculty" */
export type Academic_Faculty_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "academic_faculty" */
export type Academic_Faculty_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Faculty_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Faculty_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "academic.faculty" */
export enum Academic_Faculty_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Academic_Faculty_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Faculty_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Faculty_Bool_Exp;
};

/** columns and relationships of "academic.section" */
export type Academic_Section = {
  __typename?: 'academic_section';
  /** An object relationship */
  batch: Academic_Batch;
  batch_id: Scalars['uuid']['output'];
  capacity?: Maybe<Scalars['Int']['output']>;
  /** An array relationship */
  class_representatives: Array<Academic_Class_Representative>;
  /** An aggregate relationship */
  class_representatives_aggregate: Academic_Class_Representative_Aggregate;
  /** An array relationship */
  course_offerings: Array<Academic_Course_Offering>;
  /** An aggregate relationship */
  course_offerings_aggregate: Academic_Course_Offering_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** columns and relationships of "academic.section" */
export type Academic_SectionClass_RepresentativesArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "academic.section" */
export type Academic_SectionClass_Representatives_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "academic.section" */
export type Academic_SectionCourse_OfferingsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


/** columns and relationships of "academic.section" */
export type Academic_SectionCourse_Offerings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};

/** aggregated selection of "academic.section" */
export type Academic_Section_Aggregate = {
  __typename?: 'academic_section_aggregate';
  aggregate?: Maybe<Academic_Section_Aggregate_Fields>;
  nodes: Array<Academic_Section>;
};

export type Academic_Section_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Academic_Section_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Academic_Section_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Academic_Section_Aggregate_Bool_Exp_Count>;
};

export type Academic_Section_Aggregate_Bool_Exp_Bool_And = {
  arguments: Academic_Section_Select_Column_Academic_Section_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Section_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Section_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Academic_Section_Select_Column_Academic_Section_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Section_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Academic_Section_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_Section_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_Section_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.section" */
export type Academic_Section_Aggregate_Fields = {
  __typename?: 'academic_section_aggregate_fields';
  avg?: Maybe<Academic_Section_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_Section_Max_Fields>;
  min?: Maybe<Academic_Section_Min_Fields>;
  stddev?: Maybe<Academic_Section_Stddev_Fields>;
  stddev_pop?: Maybe<Academic_Section_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Academic_Section_Stddev_Samp_Fields>;
  sum?: Maybe<Academic_Section_Sum_Fields>;
  var_pop?: Maybe<Academic_Section_Var_Pop_Fields>;
  var_samp?: Maybe<Academic_Section_Var_Samp_Fields>;
  variance?: Maybe<Academic_Section_Variance_Fields>;
};


/** aggregate fields of "academic.section" */
export type Academic_Section_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_Section_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.section" */
export type Academic_Section_Aggregate_Order_By = {
  avg?: InputMaybe<Academic_Section_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_Section_Max_Order_By>;
  min?: InputMaybe<Academic_Section_Min_Order_By>;
  stddev?: InputMaybe<Academic_Section_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Academic_Section_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Academic_Section_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Academic_Section_Sum_Order_By>;
  var_pop?: InputMaybe<Academic_Section_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Academic_Section_Var_Samp_Order_By>;
  variance?: InputMaybe<Academic_Section_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "academic.section" */
export type Academic_Section_Arr_Rel_Insert_Input = {
  data: Array<Academic_Section_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Section_On_Conflict>;
};

/** aggregate avg on columns */
export type Academic_Section_Avg_Fields = {
  __typename?: 'academic_section_avg_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "academic.section" */
export type Academic_Section_Avg_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "academic.section". All fields are combined with a logical 'AND'. */
export type Academic_Section_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_Section_Bool_Exp>>;
  _not?: InputMaybe<Academic_Section_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_Section_Bool_Exp>>;
  batch?: InputMaybe<Academic_Batch_Bool_Exp>;
  batch_id?: InputMaybe<Uuid_Comparison_Exp>;
  capacity?: InputMaybe<Int_Comparison_Exp>;
  class_representatives?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.section" */
export enum Academic_Section_Constraint {
  /** unique or primary key constraint on columns "batch_id", "name" */
  SectionBatchIdNameKey = 'section_batch_id_name_key',
  /** unique or primary key constraint on columns "id" */
  SectionPkey = 'section_pkey'
}

/** input type for incrementing numeric columns in table "academic.section" */
export type Academic_Section_Inc_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "academic.section" */
export type Academic_Section_Insert_Input = {
  batch?: InputMaybe<Academic_Batch_Obj_Rel_Insert_Input>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  class_representatives?: InputMaybe<Academic_Class_Representative_Arr_Rel_Insert_Input>;
  course_offerings?: InputMaybe<Academic_Course_Offering_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Academic_Section_Max_Fields = {
  __typename?: 'academic_section_max_fields';
  batch_id?: Maybe<Scalars['uuid']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "academic.section" */
export type Academic_Section_Max_Order_By = {
  batch_id?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_Section_Min_Fields = {
  __typename?: 'academic_section_min_fields';
  batch_id?: Maybe<Scalars['uuid']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "academic.section" */
export type Academic_Section_Min_Order_By = {
  batch_id?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.section" */
export type Academic_Section_Mutation_Response = {
  __typename?: 'academic_section_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_Section>;
};

/** input type for inserting object relation for remote table "academic.section" */
export type Academic_Section_Obj_Rel_Insert_Input = {
  data: Academic_Section_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_Section_On_Conflict>;
};

/** on_conflict condition type for table "academic.section" */
export type Academic_Section_On_Conflict = {
  constraint: Academic_Section_Constraint;
  update_columns?: Array<Academic_Section_Update_Column>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.section". */
export type Academic_Section_Order_By = {
  batch?: InputMaybe<Academic_Batch_Order_By>;
  batch_id?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Order_By>;
  course_offerings_aggregate?: InputMaybe<Academic_Course_Offering_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.section */
export type Academic_Section_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.section" */
export enum Academic_Section_Select_Column {
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "academic_section_aggregate_bool_exp_bool_and_arguments_columns" columns of table "academic.section" */
export enum Academic_Section_Select_Column_Academic_Section_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "academic_section_aggregate_bool_exp_bool_or_arguments_columns" columns of table "academic.section" */
export enum Academic_Section_Select_Column_Academic_Section_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "academic.section" */
export type Academic_Section_Set_Input = {
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Academic_Section_Stddev_Fields = {
  __typename?: 'academic_section_stddev_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "academic.section" */
export type Academic_Section_Stddev_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Academic_Section_Stddev_Pop_Fields = {
  __typename?: 'academic_section_stddev_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "academic.section" */
export type Academic_Section_Stddev_Pop_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Academic_Section_Stddev_Samp_Fields = {
  __typename?: 'academic_section_stddev_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "academic.section" */
export type Academic_Section_Stddev_Samp_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "academic_section" */
export type Academic_Section_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_Section_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_Section_Stream_Cursor_Value_Input = {
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Academic_Section_Sum_Fields = {
  __typename?: 'academic_section_sum_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "academic.section" */
export type Academic_Section_Sum_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** update columns of table "academic.section" */
export enum Academic_Section_Update_Column {
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Academic_Section_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Academic_Section_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_Section_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_Section_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Academic_Section_Var_Pop_Fields = {
  __typename?: 'academic_section_var_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "academic.section" */
export type Academic_Section_Var_Pop_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Academic_Section_Var_Samp_Fields = {
  __typename?: 'academic_section_var_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "academic.section" */
export type Academic_Section_Var_Samp_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Academic_Section_Variance_Fields = {
  __typename?: 'academic_section_variance_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "academic.section" */
export type Academic_Section_Variance_Order_By = {
  capacity?: InputMaybe<Order_By>;
};

/** Students course enrollments */
export type Academic_User_Enrollment = {
  __typename?: 'academic_user_enrollment';
  /** An object relationship */
  account: User_Account;
  /** An object relationship */
  course_offering: Academic_Course_Offering;
  course_offering_id: Scalars['uuid']['output'];
  created_at: Scalars['timestamptz']['output'];
  enrolled_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "academic.user_enrollment" */
export type Academic_User_Enrollment_Aggregate = {
  __typename?: 'academic_user_enrollment_aggregate';
  aggregate?: Maybe<Academic_User_Enrollment_Aggregate_Fields>;
  nodes: Array<Academic_User_Enrollment>;
};

export type Academic_User_Enrollment_Aggregate_Bool_Exp = {
  count?: InputMaybe<Academic_User_Enrollment_Aggregate_Bool_Exp_Count>;
};

export type Academic_User_Enrollment_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "academic.user_enrollment" */
export type Academic_User_Enrollment_Aggregate_Fields = {
  __typename?: 'academic_user_enrollment_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Academic_User_Enrollment_Max_Fields>;
  min?: Maybe<Academic_User_Enrollment_Min_Fields>;
};


/** aggregate fields of "academic.user_enrollment" */
export type Academic_User_Enrollment_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "academic.user_enrollment" */
export type Academic_User_Enrollment_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Academic_User_Enrollment_Max_Order_By>;
  min?: InputMaybe<Academic_User_Enrollment_Min_Order_By>;
};

/** input type for inserting array relation for remote table "academic.user_enrollment" */
export type Academic_User_Enrollment_Arr_Rel_Insert_Input = {
  data: Array<Academic_User_Enrollment_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Academic_User_Enrollment_On_Conflict>;
};

/** Boolean expression to filter rows from the table "academic.user_enrollment". All fields are combined with a logical 'AND'. */
export type Academic_User_Enrollment_Bool_Exp = {
  _and?: InputMaybe<Array<Academic_User_Enrollment_Bool_Exp>>;
  _not?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
  _or?: InputMaybe<Array<Academic_User_Enrollment_Bool_Exp>>;
  account?: InputMaybe<User_Account_Bool_Exp>;
  course_offering?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offering_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  enrolled_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "academic.user_enrollment" */
export enum Academic_User_Enrollment_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserEnrollmentPkey = 'user_enrollment_pkey'
}

/** input type for inserting data into table "academic.user_enrollment" */
export type Academic_User_Enrollment_Insert_Input = {
  account?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
  course_offering?: InputMaybe<Academic_Course_Offering_Obj_Rel_Insert_Input>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  enrolled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Academic_User_Enrollment_Max_Fields = {
  __typename?: 'academic_user_enrollment_max_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  enrolled_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "academic.user_enrollment" */
export type Academic_User_Enrollment_Max_Order_By = {
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  enrolled_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Academic_User_Enrollment_Min_Fields = {
  __typename?: 'academic_user_enrollment_min_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  enrolled_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "academic.user_enrollment" */
export type Academic_User_Enrollment_Min_Order_By = {
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  enrolled_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "academic.user_enrollment" */
export type Academic_User_Enrollment_Mutation_Response = {
  __typename?: 'academic_user_enrollment_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Academic_User_Enrollment>;
};

/** on_conflict condition type for table "academic.user_enrollment" */
export type Academic_User_Enrollment_On_Conflict = {
  constraint: Academic_User_Enrollment_Constraint;
  update_columns?: Array<Academic_User_Enrollment_Update_Column>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};

/** Ordering options when selecting data from "academic.user_enrollment". */
export type Academic_User_Enrollment_Order_By = {
  account?: InputMaybe<User_Account_Order_By>;
  course_offering?: InputMaybe<Academic_Course_Offering_Order_By>;
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  enrolled_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: academic.user_enrollment */
export type Academic_User_Enrollment_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "academic.user_enrollment" */
export enum Academic_User_Enrollment_Select_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EnrolledAt = 'enrolled_at',
  /** column name */
  Id = 'id',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "academic.user_enrollment" */
export type Academic_User_Enrollment_Set_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  enrolled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "academic_user_enrollment" */
export type Academic_User_Enrollment_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Academic_User_Enrollment_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Academic_User_Enrollment_Stream_Cursor_Value_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  enrolled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "academic.user_enrollment" */
export enum Academic_User_Enrollment_Update_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EnrolledAt = 'enrolled_at',
  /** column name */
  Id = 'id',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Academic_User_Enrollment_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Academic_User_Enrollment_Set_Input>;
  /** filter the rows which have to be updated */
  where: Academic_User_Enrollment_Bool_Exp;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['date']['input']>;
  _gt?: InputMaybe<Scalars['date']['input']>;
  _gte?: InputMaybe<Scalars['date']['input']>;
  _in?: InputMaybe<Array<Scalars['date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['date']['input']>;
  _lte?: InputMaybe<Scalars['date']['input']>;
  _neq?: InputMaybe<Scalars['date']['input']>;
  _nin?: InputMaybe<Array<Scalars['date']['input']>>;
};

/** columns and relationships of "event.event" */
export type Event_Event = {
  __typename?: 'event_event';
  /** An object relationship */
  course_offering?: Maybe<Academic_Course_Offering>;
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at: Scalars['timestamptz']['output'];
  created_by: Scalars['uuid']['output'];
  date: Scalars['date']['output'];
  description?: Maybe<Scalars['String']['output']>;
  end_time: Scalars['timetz']['output'];
  /** An array relationship */
  event_targets: Array<Event_Event_Target>;
  /** An aggregate relationship */
  event_targets_aggregate: Event_Event_Target_Aggregate;
  event_type: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  metadata?: Maybe<Scalars['jsonb']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  routine_id?: Maybe<Scalars['uuid']['output']>;
  start_time: Scalars['timetz']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** columns and relationships of "event.event" */
export type Event_EventEvent_TargetsArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


/** columns and relationships of "event.event" */
export type Event_EventEvent_Targets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


/** columns and relationships of "event.event" */
export type Event_EventMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "event.event" */
export type Event_Event_Aggregate = {
  __typename?: 'event_event_aggregate';
  aggregate?: Maybe<Event_Event_Aggregate_Fields>;
  nodes: Array<Event_Event>;
};

export type Event_Event_Aggregate_Bool_Exp = {
  count?: InputMaybe<Event_Event_Aggregate_Bool_Exp_Count>;
};

export type Event_Event_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Event_Event_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Event_Event_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "event.event" */
export type Event_Event_Aggregate_Fields = {
  __typename?: 'event_event_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Max_Fields>;
  min?: Maybe<Event_Event_Min_Fields>;
};


/** aggregate fields of "event.event" */
export type Event_Event_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "event.event" */
export type Event_Event_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Event_Event_Max_Order_By>;
  min?: InputMaybe<Event_Event_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Event_Event_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "event.event" */
export type Event_Event_Arr_Rel_Insert_Input = {
  data: Array<Event_Event_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Event_On_Conflict>;
};

/** Documents and resources attached to events. */
export type Event_Event_Attachment = {
  __typename?: 'event_event_attachment';
  attachment_type: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  event_id: Scalars['uuid']['output'];
  file_size?: Maybe<Scalars['Int']['output']>;
  id: Scalars['uuid']['output'];
  mime_type?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  uploaded_by?: Maybe<Scalars['uuid']['output']>;
  url: Scalars['String']['output'];
};

/** aggregated selection of "event.event_attachment" */
export type Event_Event_Attachment_Aggregate = {
  __typename?: 'event_event_attachment_aggregate';
  aggregate?: Maybe<Event_Event_Attachment_Aggregate_Fields>;
  nodes: Array<Event_Event_Attachment>;
};

/** aggregate fields of "event.event_attachment" */
export type Event_Event_Attachment_Aggregate_Fields = {
  __typename?: 'event_event_attachment_aggregate_fields';
  avg?: Maybe<Event_Event_Attachment_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Attachment_Max_Fields>;
  min?: Maybe<Event_Event_Attachment_Min_Fields>;
  stddev?: Maybe<Event_Event_Attachment_Stddev_Fields>;
  stddev_pop?: Maybe<Event_Event_Attachment_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Event_Event_Attachment_Stddev_Samp_Fields>;
  sum?: Maybe<Event_Event_Attachment_Sum_Fields>;
  var_pop?: Maybe<Event_Event_Attachment_Var_Pop_Fields>;
  var_samp?: Maybe<Event_Event_Attachment_Var_Samp_Fields>;
  variance?: Maybe<Event_Event_Attachment_Variance_Fields>;
};


/** aggregate fields of "event.event_attachment" */
export type Event_Event_Attachment_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Attachment_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Event_Event_Attachment_Avg_Fields = {
  __typename?: 'event_event_attachment_avg_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "event.event_attachment". All fields are combined with a logical 'AND'. */
export type Event_Event_Attachment_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Attachment_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Attachment_Bool_Exp>>;
  attachment_type?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  file_size?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  mime_type?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  uploaded_by?: InputMaybe<Uuid_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_attachment" */
export enum Event_Event_Attachment_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventAttachmentPkey = 'event_attachment_pkey'
}

/** input type for incrementing numeric columns in table "event.event_attachment" */
export type Event_Event_Attachment_Inc_Input = {
  file_size?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "event.event_attachment" */
export type Event_Event_Attachment_Insert_Input = {
  attachment_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  file_size?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mime_type?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  uploaded_by?: InputMaybe<Scalars['uuid']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Attachment_Max_Fields = {
  __typename?: 'event_event_attachment_max_fields';
  attachment_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  file_size?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mime_type?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  uploaded_by?: Maybe<Scalars['uuid']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Attachment_Min_Fields = {
  __typename?: 'event_event_attachment_min_fields';
  attachment_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  file_size?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mime_type?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  uploaded_by?: Maybe<Scalars['uuid']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "event.event_attachment" */
export type Event_Event_Attachment_Mutation_Response = {
  __typename?: 'event_event_attachment_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Attachment>;
};

/** on_conflict condition type for table "event.event_attachment" */
export type Event_Event_Attachment_On_Conflict = {
  constraint: Event_Event_Attachment_Constraint;
  update_columns?: Array<Event_Event_Attachment_Update_Column>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_attachment". */
export type Event_Event_Attachment_Order_By = {
  attachment_type?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  file_size?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mime_type?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  uploaded_by?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_attachment */
export type Event_Event_Attachment_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_attachment" */
export enum Event_Event_Attachment_Select_Column {
  /** column name */
  AttachmentType = 'attachment_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  EventId = 'event_id',
  /** column name */
  FileSize = 'file_size',
  /** column name */
  Id = 'id',
  /** column name */
  MimeType = 'mime_type',
  /** column name */
  Title = 'title',
  /** column name */
  UploadedBy = 'uploaded_by',
  /** column name */
  Url = 'url'
}

/** input type for updating data in table "event.event_attachment" */
export type Event_Event_Attachment_Set_Input = {
  attachment_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  file_size?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mime_type?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  uploaded_by?: InputMaybe<Scalars['uuid']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Event_Event_Attachment_Stddev_Fields = {
  __typename?: 'event_event_attachment_stddev_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Event_Event_Attachment_Stddev_Pop_Fields = {
  __typename?: 'event_event_attachment_stddev_pop_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Event_Event_Attachment_Stddev_Samp_Fields = {
  __typename?: 'event_event_attachment_stddev_samp_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "event_event_attachment" */
export type Event_Event_Attachment_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Attachment_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Attachment_Stream_Cursor_Value_Input = {
  attachment_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  file_size?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mime_type?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  uploaded_by?: InputMaybe<Scalars['uuid']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Event_Event_Attachment_Sum_Fields = {
  __typename?: 'event_event_attachment_sum_fields';
  file_size?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "event.event_attachment" */
export enum Event_Event_Attachment_Update_Column {
  /** column name */
  AttachmentType = 'attachment_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  EventId = 'event_id',
  /** column name */
  FileSize = 'file_size',
  /** column name */
  Id = 'id',
  /** column name */
  MimeType = 'mime_type',
  /** column name */
  Title = 'title',
  /** column name */
  UploadedBy = 'uploaded_by',
  /** column name */
  Url = 'url'
}

export type Event_Event_Attachment_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Event_Event_Attachment_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Attachment_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Attachment_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Event_Event_Attachment_Var_Pop_Fields = {
  __typename?: 'event_event_attachment_var_pop_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Event_Event_Attachment_Var_Samp_Fields = {
  __typename?: 'event_event_attachment_var_samp_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Event_Event_Attachment_Variance_Fields = {
  __typename?: 'event_event_attachment_variance_fields';
  file_size?: Maybe<Scalars['Float']['output']>;
};

/** Attendance tracking for regular lectures (without participant records). */
export type Event_Event_Attendance = {
  __typename?: 'event_event_attendance';
  created_at: Scalars['timestamptz']['output'];
  event_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  marked_at: Scalars['timestamptz']['output'];
  marked_by: Scalars['uuid']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "event.event_attendance" */
export type Event_Event_Attendance_Aggregate = {
  __typename?: 'event_event_attendance_aggregate';
  aggregate?: Maybe<Event_Event_Attendance_Aggregate_Fields>;
  nodes: Array<Event_Event_Attendance>;
};

/** aggregate fields of "event.event_attendance" */
export type Event_Event_Attendance_Aggregate_Fields = {
  __typename?: 'event_event_attendance_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Attendance_Max_Fields>;
  min?: Maybe<Event_Event_Attendance_Min_Fields>;
};


/** aggregate fields of "event.event_attendance" */
export type Event_Event_Attendance_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Attendance_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.event_attendance". All fields are combined with a logical 'AND'. */
export type Event_Event_Attendance_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Attendance_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Attendance_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  marked_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  marked_by?: InputMaybe<Uuid_Comparison_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_attendance" */
export enum Event_Event_Attendance_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventAttendancePkey = 'event_attendance_pkey'
}

/** input type for inserting data into table "event.event_attendance" */
export type Event_Event_Attendance_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  marked_at?: InputMaybe<Scalars['timestamptz']['input']>;
  marked_by?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Attendance_Max_Fields = {
  __typename?: 'event_event_attendance_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  marked_at?: Maybe<Scalars['timestamptz']['output']>;
  marked_by?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Attendance_Min_Fields = {
  __typename?: 'event_event_attendance_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  marked_at?: Maybe<Scalars['timestamptz']['output']>;
  marked_by?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "event.event_attendance" */
export type Event_Event_Attendance_Mutation_Response = {
  __typename?: 'event_event_attendance_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Attendance>;
};

/** on_conflict condition type for table "event.event_attendance" */
export type Event_Event_Attendance_On_Conflict = {
  constraint: Event_Event_Attendance_Constraint;
  update_columns?: Array<Event_Event_Attendance_Update_Column>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_attendance". */
export type Event_Event_Attendance_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  marked_at?: InputMaybe<Order_By>;
  marked_by?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_attendance */
export type Event_Event_Attendance_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_attendance" */
export enum Event_Event_Attendance_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  MarkedAt = 'marked_at',
  /** column name */
  MarkedBy = 'marked_by',
  /** column name */
  Notes = 'notes',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "event.event_attendance" */
export type Event_Event_Attendance_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  marked_at?: InputMaybe<Scalars['timestamptz']['input']>;
  marked_by?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "event_event_attendance" */
export type Event_Event_Attendance_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Attendance_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Attendance_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  marked_at?: InputMaybe<Scalars['timestamptz']['input']>;
  marked_by?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "event.event_attendance" */
export enum Event_Event_Attendance_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  MarkedAt = 'marked_at',
  /** column name */
  MarkedBy = 'marked_by',
  /** column name */
  Notes = 'notes',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Event_Event_Attendance_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Attendance_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Attendance_Bool_Exp;
};

/** Boolean expression to filter rows from the table "event.event". All fields are combined with a logical 'AND'. */
export type Event_Event_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Bool_Exp>>;
  course_offering?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offering_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  date?: InputMaybe<Date_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  end_time?: InputMaybe<Timetz_Comparison_Exp>;
  event_targets?: InputMaybe<Event_Event_Target_Bool_Exp>;
  event_targets_aggregate?: InputMaybe<Event_Event_Target_Aggregate_Bool_Exp>;
  event_type?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  priority?: InputMaybe<String_Comparison_Exp>;
  routine_id?: InputMaybe<Uuid_Comparison_Exp>;
  start_time?: InputMaybe<Timetz_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** Cancellation records with rescheduling links. */
export type Event_Event_Cancellation = {
  __typename?: 'event_event_cancellation';
  cancelled_at: Scalars['timestamptz']['output'];
  cancelled_by: Scalars['uuid']['output'];
  event_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  notification_sent: Scalars['Boolean']['output'];
  notification_sent_at?: Maybe<Scalars['timestamptz']['output']>;
  reason: Scalars['String']['output'];
  rescheduled_event_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregated selection of "event.event_cancellation" */
export type Event_Event_Cancellation_Aggregate = {
  __typename?: 'event_event_cancellation_aggregate';
  aggregate?: Maybe<Event_Event_Cancellation_Aggregate_Fields>;
  nodes: Array<Event_Event_Cancellation>;
};

/** aggregate fields of "event.event_cancellation" */
export type Event_Event_Cancellation_Aggregate_Fields = {
  __typename?: 'event_event_cancellation_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Cancellation_Max_Fields>;
  min?: Maybe<Event_Event_Cancellation_Min_Fields>;
};


/** aggregate fields of "event.event_cancellation" */
export type Event_Event_Cancellation_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Cancellation_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.event_cancellation". All fields are combined with a logical 'AND'. */
export type Event_Event_Cancellation_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Cancellation_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Cancellation_Bool_Exp>>;
  cancelled_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  cancelled_by?: InputMaybe<Uuid_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  notification_sent?: InputMaybe<Boolean_Comparison_Exp>;
  notification_sent_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  rescheduled_event_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_cancellation" */
export enum Event_Event_Cancellation_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventCancellationPkey = 'event_cancellation_pkey'
}

/** input type for inserting data into table "event.event_cancellation" */
export type Event_Event_Cancellation_Insert_Input = {
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  cancelled_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  rescheduled_event_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Cancellation_Max_Fields = {
  __typename?: 'event_event_cancellation_max_fields';
  cancelled_at?: Maybe<Scalars['timestamptz']['output']>;
  cancelled_by?: Maybe<Scalars['uuid']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notification_sent_at?: Maybe<Scalars['timestamptz']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  rescheduled_event_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Cancellation_Min_Fields = {
  __typename?: 'event_event_cancellation_min_fields';
  cancelled_at?: Maybe<Scalars['timestamptz']['output']>;
  cancelled_by?: Maybe<Scalars['uuid']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notification_sent_at?: Maybe<Scalars['timestamptz']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  rescheduled_event_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "event.event_cancellation" */
export type Event_Event_Cancellation_Mutation_Response = {
  __typename?: 'event_event_cancellation_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Cancellation>;
};

/** on_conflict condition type for table "event.event_cancellation" */
export type Event_Event_Cancellation_On_Conflict = {
  constraint: Event_Event_Cancellation_Constraint;
  update_columns?: Array<Event_Event_Cancellation_Update_Column>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_cancellation". */
export type Event_Event_Cancellation_Order_By = {
  cancelled_at?: InputMaybe<Order_By>;
  cancelled_by?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notification_sent?: InputMaybe<Order_By>;
  notification_sent_at?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  rescheduled_event_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_cancellation */
export type Event_Event_Cancellation_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_cancellation" */
export enum Event_Event_Cancellation_Select_Column {
  /** column name */
  CancelledAt = 'cancelled_at',
  /** column name */
  CancelledBy = 'cancelled_by',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  NotificationSent = 'notification_sent',
  /** column name */
  NotificationSentAt = 'notification_sent_at',
  /** column name */
  Reason = 'reason',
  /** column name */
  RescheduledEventId = 'rescheduled_event_id'
}

/** input type for updating data in table "event.event_cancellation" */
export type Event_Event_Cancellation_Set_Input = {
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  cancelled_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  rescheduled_event_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "event_event_cancellation" */
export type Event_Event_Cancellation_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Cancellation_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Cancellation_Stream_Cursor_Value_Input = {
  cancelled_at?: InputMaybe<Scalars['timestamptz']['input']>;
  cancelled_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  rescheduled_event_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "event.event_cancellation" */
export enum Event_Event_Cancellation_Update_Column {
  /** column name */
  CancelledAt = 'cancelled_at',
  /** column name */
  CancelledBy = 'cancelled_by',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  NotificationSent = 'notification_sent',
  /** column name */
  NotificationSentAt = 'notification_sent_at',
  /** column name */
  Reason = 'reason',
  /** column name */
  RescheduledEventId = 'rescheduled_event_id'
}

export type Event_Event_Cancellation_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Cancellation_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Cancellation_Bool_Exp;
};

/** Audit trail for all event modifications. */
export type Event_Event_Change = {
  __typename?: 'event_event_change';
  change_type: Scalars['String']['output'];
  changed_at: Scalars['timestamptz']['output'];
  changed_by: Scalars['uuid']['output'];
  event_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  new_value: Scalars['jsonb']['output'];
  notification_sent: Scalars['Boolean']['output'];
  notification_sent_at: Scalars['timestamptz']['output'];
  old_value: Scalars['jsonb']['output'];
  reason: Scalars['String']['output'];
};


/** Audit trail for all event modifications. */
export type Event_Event_ChangeNew_ValueArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** Audit trail for all event modifications. */
export type Event_Event_ChangeOld_ValueArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "event.event_change" */
export type Event_Event_Change_Aggregate = {
  __typename?: 'event_event_change_aggregate';
  aggregate?: Maybe<Event_Event_Change_Aggregate_Fields>;
  nodes: Array<Event_Event_Change>;
};

/** aggregate fields of "event.event_change" */
export type Event_Event_Change_Aggregate_Fields = {
  __typename?: 'event_event_change_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Change_Max_Fields>;
  min?: Maybe<Event_Event_Change_Min_Fields>;
};


/** aggregate fields of "event.event_change" */
export type Event_Event_Change_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Change_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Event_Event_Change_Append_Input = {
  new_value?: InputMaybe<Scalars['jsonb']['input']>;
  old_value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "event.event_change". All fields are combined with a logical 'AND'. */
export type Event_Event_Change_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Change_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Change_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Change_Bool_Exp>>;
  change_type?: InputMaybe<String_Comparison_Exp>;
  changed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  changed_by?: InputMaybe<Uuid_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  new_value?: InputMaybe<Jsonb_Comparison_Exp>;
  notification_sent?: InputMaybe<Boolean_Comparison_Exp>;
  notification_sent_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  old_value?: InputMaybe<Jsonb_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_change" */
export enum Event_Event_Change_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventChangePkey = 'event_change_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Event_Event_Change_Delete_At_Path_Input = {
  new_value?: InputMaybe<Array<Scalars['String']['input']>>;
  old_value?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Event_Event_Change_Delete_Elem_Input = {
  new_value?: InputMaybe<Scalars['Int']['input']>;
  old_value?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Event_Event_Change_Delete_Key_Input = {
  new_value?: InputMaybe<Scalars['String']['input']>;
  old_value?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "event.event_change" */
export type Event_Event_Change_Insert_Input = {
  change_type?: InputMaybe<Scalars['String']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  new_value?: InputMaybe<Scalars['jsonb']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  old_value?: InputMaybe<Scalars['jsonb']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Change_Max_Fields = {
  __typename?: 'event_event_change_max_fields';
  change_type?: Maybe<Scalars['String']['output']>;
  changed_at?: Maybe<Scalars['timestamptz']['output']>;
  changed_by?: Maybe<Scalars['uuid']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notification_sent_at?: Maybe<Scalars['timestamptz']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Change_Min_Fields = {
  __typename?: 'event_event_change_min_fields';
  change_type?: Maybe<Scalars['String']['output']>;
  changed_at?: Maybe<Scalars['timestamptz']['output']>;
  changed_by?: Maybe<Scalars['uuid']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notification_sent_at?: Maybe<Scalars['timestamptz']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "event.event_change" */
export type Event_Event_Change_Mutation_Response = {
  __typename?: 'event_event_change_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Change>;
};

/** on_conflict condition type for table "event.event_change" */
export type Event_Event_Change_On_Conflict = {
  constraint: Event_Event_Change_Constraint;
  update_columns?: Array<Event_Event_Change_Update_Column>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_change". */
export type Event_Event_Change_Order_By = {
  change_type?: InputMaybe<Order_By>;
  changed_at?: InputMaybe<Order_By>;
  changed_by?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  new_value?: InputMaybe<Order_By>;
  notification_sent?: InputMaybe<Order_By>;
  notification_sent_at?: InputMaybe<Order_By>;
  old_value?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_change */
export type Event_Event_Change_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Event_Event_Change_Prepend_Input = {
  new_value?: InputMaybe<Scalars['jsonb']['input']>;
  old_value?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "event.event_change" */
export enum Event_Event_Change_Select_Column {
  /** column name */
  ChangeType = 'change_type',
  /** column name */
  ChangedAt = 'changed_at',
  /** column name */
  ChangedBy = 'changed_by',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  NewValue = 'new_value',
  /** column name */
  NotificationSent = 'notification_sent',
  /** column name */
  NotificationSentAt = 'notification_sent_at',
  /** column name */
  OldValue = 'old_value',
  /** column name */
  Reason = 'reason'
}

/** input type for updating data in table "event.event_change" */
export type Event_Event_Change_Set_Input = {
  change_type?: InputMaybe<Scalars['String']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  new_value?: InputMaybe<Scalars['jsonb']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  old_value?: InputMaybe<Scalars['jsonb']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "event_event_change" */
export type Event_Event_Change_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Change_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Change_Stream_Cursor_Value_Input = {
  change_type?: InputMaybe<Scalars['String']['input']>;
  changed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  changed_by?: InputMaybe<Scalars['uuid']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  new_value?: InputMaybe<Scalars['jsonb']['input']>;
  notification_sent?: InputMaybe<Scalars['Boolean']['input']>;
  notification_sent_at?: InputMaybe<Scalars['timestamptz']['input']>;
  old_value?: InputMaybe<Scalars['jsonb']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "event.event_change" */
export enum Event_Event_Change_Update_Column {
  /** column name */
  ChangeType = 'change_type',
  /** column name */
  ChangedAt = 'changed_at',
  /** column name */
  ChangedBy = 'changed_by',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  NewValue = 'new_value',
  /** column name */
  NotificationSent = 'notification_sent',
  /** column name */
  NotificationSentAt = 'notification_sent_at',
  /** column name */
  OldValue = 'old_value',
  /** column name */
  Reason = 'reason'
}

export type Event_Event_Change_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Event_Event_Change_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Event_Event_Change_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Event_Event_Change_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Event_Event_Change_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Event_Event_Change_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Change_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Change_Bool_Exp;
};

/** unique or primary key constraints on table "event.event" */
export enum Event_Event_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventPkey = 'event_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Event_Event_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Event_Event_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Event_Event_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "event.event" */
export type Event_Event_Insert_Input = {
  course_offering?: InputMaybe<Academic_Course_Offering_Obj_Rel_Insert_Input>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_targets?: InputMaybe<Event_Event_Target_Arr_Rel_Insert_Input>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Instructor assignments per room (supports multi-instructor). */
export type Event_Event_Instructor = {
  __typename?: 'event_event_instructor';
  created_at: Scalars['timestamptz']['output'];
  event_room_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  instructor_id: Scalars['uuid']['output'];
  is_primary?: Maybe<Scalars['Boolean']['output']>;
  responsibility_notes?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "event.event_instructor" */
export type Event_Event_Instructor_Aggregate = {
  __typename?: 'event_event_instructor_aggregate';
  aggregate?: Maybe<Event_Event_Instructor_Aggregate_Fields>;
  nodes: Array<Event_Event_Instructor>;
};

/** aggregate fields of "event.event_instructor" */
export type Event_Event_Instructor_Aggregate_Fields = {
  __typename?: 'event_event_instructor_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Instructor_Max_Fields>;
  min?: Maybe<Event_Event_Instructor_Min_Fields>;
};


/** aggregate fields of "event.event_instructor" */
export type Event_Event_Instructor_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Instructor_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.event_instructor". All fields are combined with a logical 'AND'. */
export type Event_Event_Instructor_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Instructor_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Instructor_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event_room_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  instructor_id?: InputMaybe<Uuid_Comparison_Exp>;
  is_primary?: InputMaybe<Boolean_Comparison_Exp>;
  responsibility_notes?: InputMaybe<String_Comparison_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_instructor" */
export enum Event_Event_Instructor_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventInstructorPkey = 'event_instructor_pkey'
}

/** input type for inserting data into table "event.event_instructor" */
export type Event_Event_Instructor_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  instructor_id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  responsibility_notes?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Instructor_Max_Fields = {
  __typename?: 'event_event_instructor_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_room_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  instructor_id?: Maybe<Scalars['uuid']['output']>;
  responsibility_notes?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Instructor_Min_Fields = {
  __typename?: 'event_event_instructor_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_room_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  instructor_id?: Maybe<Scalars['uuid']['output']>;
  responsibility_notes?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "event.event_instructor" */
export type Event_Event_Instructor_Mutation_Response = {
  __typename?: 'event_event_instructor_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Instructor>;
};

/** on_conflict condition type for table "event.event_instructor" */
export type Event_Event_Instructor_On_Conflict = {
  constraint: Event_Event_Instructor_Constraint;
  update_columns?: Array<Event_Event_Instructor_Update_Column>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_instructor". */
export type Event_Event_Instructor_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_room_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  instructor_id?: InputMaybe<Order_By>;
  is_primary?: InputMaybe<Order_By>;
  responsibility_notes?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_instructor */
export type Event_Event_Instructor_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_instructor" */
export enum Event_Event_Instructor_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventRoomId = 'event_room_id',
  /** column name */
  Id = 'id',
  /** column name */
  InstructorId = 'instructor_id',
  /** column name */
  IsPrimary = 'is_primary',
  /** column name */
  ResponsibilityNotes = 'responsibility_notes',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "event.event_instructor" */
export type Event_Event_Instructor_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  instructor_id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  responsibility_notes?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "event_event_instructor" */
export type Event_Event_Instructor_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Instructor_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Instructor_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  instructor_id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary?: InputMaybe<Scalars['Boolean']['input']>;
  responsibility_notes?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "event.event_instructor" */
export enum Event_Event_Instructor_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventRoomId = 'event_room_id',
  /** column name */
  Id = 'id',
  /** column name */
  InstructorId = 'instructor_id',
  /** column name */
  IsPrimary = 'is_primary',
  /** column name */
  ResponsibilityNotes = 'responsibility_notes',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Event_Event_Instructor_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Instructor_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Instructor_Bool_Exp;
};

/** aggregate max on columns */
export type Event_Event_Max_Fields = {
  __typename?: 'event_event_max_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  event_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  routine_id?: Maybe<Scalars['uuid']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "event.event" */
export type Event_Event_Max_Order_By = {
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  event_type?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  routine_id?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Event_Event_Min_Fields = {
  __typename?: 'event_event_min_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  event_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  routine_id?: Maybe<Scalars['uuid']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "event.event" */
export type Event_Event_Min_Order_By = {
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  event_type?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  routine_id?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "event.event" */
export type Event_Event_Mutation_Response = {
  __typename?: 'event_event_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event>;
};

/** input type for inserting object relation for remote table "event.event" */
export type Event_Event_Obj_Rel_Insert_Input = {
  data: Event_Event_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Event_On_Conflict>;
};

/** on_conflict condition type for table "event.event" */
export type Event_Event_On_Conflict = {
  constraint: Event_Event_Constraint;
  update_columns?: Array<Event_Event_Update_Column>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event". */
export type Event_Event_Order_By = {
  course_offering?: InputMaybe<Academic_Course_Offering_Order_By>;
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  event_targets_aggregate?: InputMaybe<Event_Event_Target_Aggregate_Order_By>;
  event_type?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  priority?: InputMaybe<Order_By>;
  routine_id?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** Individual participant tracking (Can be used for exams and to track attendance for a particular event). */
export type Event_Event_Participant = {
  __typename?: 'event_event_participant';
  attendance_status: Scalars['String']['output'];
  checked_in_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at: Scalars['timestamptz']['output'];
  event_id: Scalars['uuid']['output'];
  event_room_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  seat_number?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['timestamptz']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "event.event_participant" */
export type Event_Event_Participant_Aggregate = {
  __typename?: 'event_event_participant_aggregate';
  aggregate?: Maybe<Event_Event_Participant_Aggregate_Fields>;
  nodes: Array<Event_Event_Participant>;
};

/** aggregate fields of "event.event_participant" */
export type Event_Event_Participant_Aggregate_Fields = {
  __typename?: 'event_event_participant_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Participant_Max_Fields>;
  min?: Maybe<Event_Event_Participant_Min_Fields>;
};


/** aggregate fields of "event.event_participant" */
export type Event_Event_Participant_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Participant_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.event_participant". All fields are combined with a logical 'AND'. */
export type Event_Event_Participant_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Participant_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Participant_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Participant_Bool_Exp>>;
  attendance_status?: InputMaybe<String_Comparison_Exp>;
  checked_in_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  event_room_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  requirements?: InputMaybe<String_Comparison_Exp>;
  seat_number?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_participant" */
export enum Event_Event_Participant_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventParticipantPkey = 'event_participant_pkey'
}

/** input type for inserting data into table "event.event_participant" */
export type Event_Event_Participant_Insert_Input = {
  attendance_status?: InputMaybe<Scalars['String']['input']>;
  checked_in_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<Scalars['String']['input']>;
  seat_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Participant_Max_Fields = {
  __typename?: 'event_event_participant_max_fields';
  attendance_status?: Maybe<Scalars['String']['output']>;
  checked_in_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  event_room_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  seat_number?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Participant_Min_Fields = {
  __typename?: 'event_event_participant_min_fields';
  attendance_status?: Maybe<Scalars['String']['output']>;
  checked_in_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  event_room_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  seat_number?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "event.event_participant" */
export type Event_Event_Participant_Mutation_Response = {
  __typename?: 'event_event_participant_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Participant>;
};

/** on_conflict condition type for table "event.event_participant" */
export type Event_Event_Participant_On_Conflict = {
  constraint: Event_Event_Participant_Constraint;
  update_columns?: Array<Event_Event_Participant_Update_Column>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_participant". */
export type Event_Event_Participant_Order_By = {
  attendance_status?: InputMaybe<Order_By>;
  checked_in_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  event_room_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  requirements?: InputMaybe<Order_By>;
  seat_number?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_participant */
export type Event_Event_Participant_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_participant" */
export enum Event_Event_Participant_Select_Column {
  /** column name */
  AttendanceStatus = 'attendance_status',
  /** column name */
  CheckedInAt = 'checked_in_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  EventRoomId = 'event_room_id',
  /** column name */
  Id = 'id',
  /** column name */
  Notes = 'notes',
  /** column name */
  Requirements = 'requirements',
  /** column name */
  SeatNumber = 'seat_number',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "event.event_participant" */
export type Event_Event_Participant_Set_Input = {
  attendance_status?: InputMaybe<Scalars['String']['input']>;
  checked_in_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<Scalars['String']['input']>;
  seat_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "event_event_participant" */
export type Event_Event_Participant_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Participant_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Participant_Stream_Cursor_Value_Input = {
  attendance_status?: InputMaybe<Scalars['String']['input']>;
  checked_in_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  event_room_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  requirements?: InputMaybe<Scalars['String']['input']>;
  seat_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "event.event_participant" */
export enum Event_Event_Participant_Update_Column {
  /** column name */
  AttendanceStatus = 'attendance_status',
  /** column name */
  CheckedInAt = 'checked_in_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  EventRoomId = 'event_room_id',
  /** column name */
  Id = 'id',
  /** column name */
  Notes = 'notes',
  /** column name */
  Requirements = 'requirements',
  /** column name */
  SeatNumber = 'seat_number',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Event_Event_Participant_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Participant_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Participant_Bool_Exp;
};

/** primary key columns input for table: event.event */
export type Event_Event_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Event_Event_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Room assignments for events (supports multi-room events). */
export type Event_Event_Room = {
  __typename?: 'event_event_room';
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['timestamptz']['output'];
  event_id: Scalars['uuid']['output'];
  id: Scalars['uuid']['output'];
  is_primary_room?: Maybe<Scalars['Boolean']['output']>;
  room_id: Scalars['uuid']['output'];
  room_notes?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "event.event_room" */
export type Event_Event_Room_Aggregate = {
  __typename?: 'event_event_room_aggregate';
  aggregate?: Maybe<Event_Event_Room_Aggregate_Fields>;
  nodes: Array<Event_Event_Room>;
};

/** aggregate fields of "event.event_room" */
export type Event_Event_Room_Aggregate_Fields = {
  __typename?: 'event_event_room_aggregate_fields';
  avg?: Maybe<Event_Event_Room_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Room_Max_Fields>;
  min?: Maybe<Event_Event_Room_Min_Fields>;
  stddev?: Maybe<Event_Event_Room_Stddev_Fields>;
  stddev_pop?: Maybe<Event_Event_Room_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Event_Event_Room_Stddev_Samp_Fields>;
  sum?: Maybe<Event_Event_Room_Sum_Fields>;
  var_pop?: Maybe<Event_Event_Room_Var_Pop_Fields>;
  var_samp?: Maybe<Event_Event_Room_Var_Samp_Fields>;
  variance?: Maybe<Event_Event_Room_Variance_Fields>;
};


/** aggregate fields of "event.event_room" */
export type Event_Event_Room_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Room_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Event_Event_Room_Avg_Fields = {
  __typename?: 'event_event_room_avg_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "event.event_room". All fields are combined with a logical 'AND'. */
export type Event_Event_Room_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Room_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Room_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Room_Bool_Exp>>;
  capacity?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_primary_room?: InputMaybe<Boolean_Comparison_Exp>;
  room_id?: InputMaybe<Uuid_Comparison_Exp>;
  room_notes?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_room" */
export enum Event_Event_Room_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventRoomPkey = 'event_room_pkey'
}

/** input type for incrementing numeric columns in table "event.event_room" */
export type Event_Event_Room_Inc_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "event.event_room" */
export type Event_Event_Room_Insert_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary_room?: InputMaybe<Scalars['Boolean']['input']>;
  room_id?: InputMaybe<Scalars['uuid']['input']>;
  room_notes?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Room_Max_Fields = {
  __typename?: 'event_event_room_max_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  room_id?: Maybe<Scalars['uuid']['output']>;
  room_notes?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Event_Event_Room_Min_Fields = {
  __typename?: 'event_event_room_min_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  room_id?: Maybe<Scalars['uuid']['output']>;
  room_notes?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "event.event_room" */
export type Event_Event_Room_Mutation_Response = {
  __typename?: 'event_event_room_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Room>;
};

/** on_conflict condition type for table "event.event_room" */
export type Event_Event_Room_On_Conflict = {
  constraint: Event_Event_Room_Constraint;
  update_columns?: Array<Event_Event_Room_Update_Column>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_room". */
export type Event_Event_Room_Order_By = {
  capacity?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_primary_room?: InputMaybe<Order_By>;
  room_id?: InputMaybe<Order_By>;
  room_notes?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_room */
export type Event_Event_Room_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_room" */
export enum Event_Event_Room_Select_Column {
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsPrimaryRoom = 'is_primary_room',
  /** column name */
  RoomId = 'room_id',
  /** column name */
  RoomNotes = 'room_notes',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "event.event_room" */
export type Event_Event_Room_Set_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary_room?: InputMaybe<Scalars['Boolean']['input']>;
  room_id?: InputMaybe<Scalars['uuid']['input']>;
  room_notes?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Event_Event_Room_Stddev_Fields = {
  __typename?: 'event_event_room_stddev_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Event_Event_Room_Stddev_Pop_Fields = {
  __typename?: 'event_event_room_stddev_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Event_Event_Room_Stddev_Samp_Fields = {
  __typename?: 'event_event_room_stddev_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "event_event_room" */
export type Event_Event_Room_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Room_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Room_Stream_Cursor_Value_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_primary_room?: InputMaybe<Scalars['Boolean']['input']>;
  room_id?: InputMaybe<Scalars['uuid']['input']>;
  room_notes?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Event_Event_Room_Sum_Fields = {
  __typename?: 'event_event_room_sum_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "event.event_room" */
export enum Event_Event_Room_Update_Column {
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsPrimaryRoom = 'is_primary_room',
  /** column name */
  RoomId = 'room_id',
  /** column name */
  RoomNotes = 'room_notes',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Event_Event_Room_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Event_Event_Room_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Room_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Room_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Event_Event_Room_Var_Pop_Fields = {
  __typename?: 'event_event_room_var_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Event_Event_Room_Var_Samp_Fields = {
  __typename?: 'event_event_room_var_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Event_Event_Room_Variance_Fields = {
  __typename?: 'event_event_room_variance_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** select columns of table "event.event" */
export enum Event_Event_Select_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Date = 'date',
  /** column name */
  Description = 'description',
  /** column name */
  EndTime = 'end_time',
  /** column name */
  EventType = 'event_type',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Priority = 'priority',
  /** column name */
  RoutineId = 'routine_id',
  /** column name */
  StartTime = 'start_time',
  /** column name */
  Status = 'status',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "event.event" */
export type Event_Event_Set_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "event_event" */
export type Event_Event_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Stream_Cursor_Value_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Group-based targeting (who should see the event). */
export type Event_Event_Target = {
  __typename?: 'event_event_target';
  created_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  event: Event_Event;
  event_id: Scalars['uuid']['output'];
  group_identifier: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  target_id: Scalars['uuid']['output'];
  target_type: Scalars['String']['output'];
};

/** aggregated selection of "event.event_target" */
export type Event_Event_Target_Aggregate = {
  __typename?: 'event_event_target_aggregate';
  aggregate?: Maybe<Event_Event_Target_Aggregate_Fields>;
  nodes: Array<Event_Event_Target>;
};

export type Event_Event_Target_Aggregate_Bool_Exp = {
  count?: InputMaybe<Event_Event_Target_Aggregate_Bool_Exp_Count>;
};

export type Event_Event_Target_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Event_Event_Target_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "event.event_target" */
export type Event_Event_Target_Aggregate_Fields = {
  __typename?: 'event_event_target_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Event_Target_Max_Fields>;
  min?: Maybe<Event_Event_Target_Min_Fields>;
};


/** aggregate fields of "event.event_target" */
export type Event_Event_Target_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "event.event_target" */
export type Event_Event_Target_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Event_Event_Target_Max_Order_By>;
  min?: InputMaybe<Event_Event_Target_Min_Order_By>;
};

/** input type for inserting array relation for remote table "event.event_target" */
export type Event_Event_Target_Arr_Rel_Insert_Input = {
  data: Array<Event_Event_Target_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Event_Target_On_Conflict>;
};

/** Boolean expression to filter rows from the table "event.event_target". All fields are combined with a logical 'AND'. */
export type Event_Event_Target_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Event_Target_Bool_Exp>>;
  _not?: InputMaybe<Event_Event_Target_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Event_Target_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event?: InputMaybe<Event_Event_Bool_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  group_identifier?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  target_id?: InputMaybe<Uuid_Comparison_Exp>;
  target_type?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.event_target" */
export enum Event_Event_Target_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventTargetPkey = 'event_target_pkey'
}

/** input type for inserting data into table "event.event_target" */
export type Event_Event_Target_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event?: InputMaybe<Event_Event_Obj_Rel_Insert_Input>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  target_id?: InputMaybe<Scalars['uuid']['input']>;
  target_type?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Event_Event_Target_Max_Fields = {
  __typename?: 'event_event_target_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  group_identifier?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  target_id?: Maybe<Scalars['uuid']['output']>;
  target_type?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "event.event_target" */
export type Event_Event_Target_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  group_identifier?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  target_id?: InputMaybe<Order_By>;
  target_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Event_Event_Target_Min_Fields = {
  __typename?: 'event_event_target_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  group_identifier?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  target_id?: Maybe<Scalars['uuid']['output']>;
  target_type?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "event.event_target" */
export type Event_Event_Target_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  group_identifier?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  target_id?: InputMaybe<Order_By>;
  target_type?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "event.event_target" */
export type Event_Event_Target_Mutation_Response = {
  __typename?: 'event_event_target_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Event_Target>;
};

/** on_conflict condition type for table "event.event_target" */
export type Event_Event_Target_On_Conflict = {
  constraint: Event_Event_Target_Constraint;
  update_columns?: Array<Event_Event_Target_Update_Column>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};

/** Ordering options when selecting data from "event.event_target". */
export type Event_Event_Target_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event?: InputMaybe<Event_Event_Order_By>;
  event_id?: InputMaybe<Order_By>;
  group_identifier?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  target_id?: InputMaybe<Order_By>;
  target_type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.event_target */
export type Event_Event_Target_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.event_target" */
export enum Event_Event_Target_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  GroupIdentifier = 'group_identifier',
  /** column name */
  Id = 'id',
  /** column name */
  TargetId = 'target_id',
  /** column name */
  TargetType = 'target_type'
}

/** input type for updating data in table "event.event_target" */
export type Event_Event_Target_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  target_id?: InputMaybe<Scalars['uuid']['input']>;
  target_type?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "event_event_target" */
export type Event_Event_Target_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Event_Target_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Event_Target_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  target_id?: InputMaybe<Scalars['uuid']['input']>;
  target_type?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "event.event_target" */
export enum Event_Event_Target_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  GroupIdentifier = 'group_identifier',
  /** column name */
  Id = 'id',
  /** column name */
  TargetId = 'target_id',
  /** column name */
  TargetType = 'target_type'
}

export type Event_Event_Target_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Target_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Target_Bool_Exp;
};

/** update columns of table "event.event" */
export enum Event_Event_Update_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  Date = 'date',
  /** column name */
  Description = 'description',
  /** column name */
  EndTime = 'end_time',
  /** column name */
  EventType = 'event_type',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Priority = 'priority',
  /** column name */
  RoutineId = 'routine_id',
  /** column name */
  StartTime = 'start_time',
  /** column name */
  Status = 'status',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Event_Event_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Event_Event_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Event_Event_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Event_Event_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Event_Event_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Event_Event_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Event_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Event_Bool_Exp;
};

/** Assign students to sub-groups within sections/courses (for labs). */
export type Event_Group_Assignment = {
  __typename?: 'event_group_assignment';
  assigned_by: Scalars['uuid']['output'];
  course_offering_id: Scalars['uuid']['output'];
  group_identifier: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  section_id: Scalars['uuid']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "event.group_assignment" */
export type Event_Group_Assignment_Aggregate = {
  __typename?: 'event_group_assignment_aggregate';
  aggregate?: Maybe<Event_Group_Assignment_Aggregate_Fields>;
  nodes: Array<Event_Group_Assignment>;
};

/** aggregate fields of "event.group_assignment" */
export type Event_Group_Assignment_Aggregate_Fields = {
  __typename?: 'event_group_assignment_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Group_Assignment_Max_Fields>;
  min?: Maybe<Event_Group_Assignment_Min_Fields>;
};


/** aggregate fields of "event.group_assignment" */
export type Event_Group_Assignment_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Group_Assignment_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.group_assignment". All fields are combined with a logical 'AND'. */
export type Event_Group_Assignment_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Group_Assignment_Bool_Exp>>;
  _not?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Group_Assignment_Bool_Exp>>;
  assigned_by?: InputMaybe<Uuid_Comparison_Exp>;
  course_offering_id?: InputMaybe<Uuid_Comparison_Exp>;
  group_identifier?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  section_id?: InputMaybe<Uuid_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.group_assignment" */
export enum Event_Group_Assignment_Constraint {
  /** unique or primary key constraint on columns "id" */
  GroupAssignmentPkey = 'group_assignment_pkey'
}

/** input type for inserting data into table "event.group_assignment" */
export type Event_Group_Assignment_Insert_Input = {
  assigned_by?: InputMaybe<Scalars['uuid']['input']>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Event_Group_Assignment_Max_Fields = {
  __typename?: 'event_group_assignment_max_fields';
  assigned_by?: Maybe<Scalars['uuid']['output']>;
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  group_identifier?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Event_Group_Assignment_Min_Fields = {
  __typename?: 'event_group_assignment_min_fields';
  assigned_by?: Maybe<Scalars['uuid']['output']>;
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  group_identifier?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "event.group_assignment" */
export type Event_Group_Assignment_Mutation_Response = {
  __typename?: 'event_group_assignment_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Group_Assignment>;
};

/** on_conflict condition type for table "event.group_assignment" */
export type Event_Group_Assignment_On_Conflict = {
  constraint: Event_Group_Assignment_Constraint;
  update_columns?: Array<Event_Group_Assignment_Update_Column>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};

/** Ordering options when selecting data from "event.group_assignment". */
export type Event_Group_Assignment_Order_By = {
  assigned_by?: InputMaybe<Order_By>;
  course_offering_id?: InputMaybe<Order_By>;
  group_identifier?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.group_assignment */
export type Event_Group_Assignment_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.group_assignment" */
export enum Event_Group_Assignment_Select_Column {
  /** column name */
  AssignedBy = 'assigned_by',
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  GroupIdentifier = 'group_identifier',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "event.group_assignment" */
export type Event_Group_Assignment_Set_Input = {
  assigned_by?: InputMaybe<Scalars['uuid']['input']>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "event_group_assignment" */
export type Event_Group_Assignment_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Group_Assignment_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Group_Assignment_Stream_Cursor_Value_Input = {
  assigned_by?: InputMaybe<Scalars['uuid']['input']>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  group_identifier?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "event.group_assignment" */
export enum Event_Group_Assignment_Update_Column {
  /** column name */
  AssignedBy = 'assigned_by',
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  GroupIdentifier = 'group_identifier',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UserId = 'user_id'
}

export type Event_Group_Assignment_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Group_Assignment_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Group_Assignment_Bool_Exp;
};

/** columns and relationships of "event.routine" */
export type Event_Routine = {
  __typename?: 'event_routine';
  /** An object relationship */
  course_offering?: Maybe<Academic_Course_Offering>;
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at: Scalars['timestamptz']['output'];
  day_of_week: Scalars['Int']['output'];
  effective_from: Scalars['date']['output'];
  effective_to: Scalars['date']['output'];
  end_time: Scalars['timetz']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  metadata?: Maybe<Scalars['jsonb']['output']>;
  name: Scalars['String']['output'];
  start_time: Scalars['timetz']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** columns and relationships of "event.routine" */
export type Event_RoutineMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "event.routine" */
export type Event_Routine_Aggregate = {
  __typename?: 'event_routine_aggregate';
  aggregate?: Maybe<Event_Routine_Aggregate_Fields>;
  nodes: Array<Event_Routine>;
};

/** aggregate fields of "event.routine" */
export type Event_Routine_Aggregate_Fields = {
  __typename?: 'event_routine_aggregate_fields';
  avg?: Maybe<Event_Routine_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Routine_Max_Fields>;
  min?: Maybe<Event_Routine_Min_Fields>;
  stddev?: Maybe<Event_Routine_Stddev_Fields>;
  stddev_pop?: Maybe<Event_Routine_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Event_Routine_Stddev_Samp_Fields>;
  sum?: Maybe<Event_Routine_Sum_Fields>;
  var_pop?: Maybe<Event_Routine_Var_Pop_Fields>;
  var_samp?: Maybe<Event_Routine_Var_Samp_Fields>;
  variance?: Maybe<Event_Routine_Variance_Fields>;
};


/** aggregate fields of "event.routine" */
export type Event_Routine_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Routine_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Event_Routine_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate avg on columns */
export type Event_Routine_Avg_Fields = {
  __typename?: 'event_routine_avg_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "event.routine". All fields are combined with a logical 'AND'. */
export type Event_Routine_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Routine_Bool_Exp>>;
  _not?: InputMaybe<Event_Routine_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Routine_Bool_Exp>>;
  course_offering?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
  course_offering_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  day_of_week?: InputMaybe<Int_Comparison_Exp>;
  effective_from?: InputMaybe<Date_Comparison_Exp>;
  effective_to?: InputMaybe<Date_Comparison_Exp>;
  end_time?: InputMaybe<Timetz_Comparison_Exp>;
  event_type?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  start_time?: InputMaybe<Timetz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.routine" */
export enum Event_Routine_Constraint {
  /** unique or primary key constraint on columns "id" */
  RoutinePkey = 'routine_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Event_Routine_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Event_Routine_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Event_Routine_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** Skip dates for recurring routines (holidays). */
export type Event_Routine_Exception = {
  __typename?: 'event_routine_exception';
  created_at: Scalars['timestamptz']['output'];
  created_by: Scalars['uuid']['output'];
  exception_date: Scalars['date']['output'];
  id: Scalars['uuid']['output'];
  reason: Scalars['String']['output'];
  routine_id: Scalars['uuid']['output'];
};

/** aggregated selection of "event.routine_exception" */
export type Event_Routine_Exception_Aggregate = {
  __typename?: 'event_routine_exception_aggregate';
  aggregate?: Maybe<Event_Routine_Exception_Aggregate_Fields>;
  nodes: Array<Event_Routine_Exception>;
};

/** aggregate fields of "event.routine_exception" */
export type Event_Routine_Exception_Aggregate_Fields = {
  __typename?: 'event_routine_exception_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Routine_Exception_Max_Fields>;
  min?: Maybe<Event_Routine_Exception_Min_Fields>;
};


/** aggregate fields of "event.routine_exception" */
export type Event_Routine_Exception_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Routine_Exception_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event.routine_exception". All fields are combined with a logical 'AND'. */
export type Event_Routine_Exception_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Routine_Exception_Bool_Exp>>;
  _not?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Routine_Exception_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<Uuid_Comparison_Exp>;
  exception_date?: InputMaybe<Date_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  reason?: InputMaybe<String_Comparison_Exp>;
  routine_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "event.routine_exception" */
export enum Event_Routine_Exception_Constraint {
  /** unique or primary key constraint on columns "id" */
  RoutineExceptionPkey = 'routine_exception_pkey'
}

/** input type for inserting data into table "event.routine_exception" */
export type Event_Routine_Exception_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  exception_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Event_Routine_Exception_Max_Fields = {
  __typename?: 'event_routine_exception_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  exception_date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  routine_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Event_Routine_Exception_Min_Fields = {
  __typename?: 'event_routine_exception_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['uuid']['output']>;
  exception_date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  routine_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "event.routine_exception" */
export type Event_Routine_Exception_Mutation_Response = {
  __typename?: 'event_routine_exception_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Routine_Exception>;
};

/** on_conflict condition type for table "event.routine_exception" */
export type Event_Routine_Exception_On_Conflict = {
  constraint: Event_Routine_Exception_Constraint;
  update_columns?: Array<Event_Routine_Exception_Update_Column>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};

/** Ordering options when selecting data from "event.routine_exception". */
export type Event_Routine_Exception_Order_By = {
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  exception_date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reason?: InputMaybe<Order_By>;
  routine_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.routine_exception */
export type Event_Routine_Exception_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event.routine_exception" */
export enum Event_Routine_Exception_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  ExceptionDate = 'exception_date',
  /** column name */
  Id = 'id',
  /** column name */
  Reason = 'reason',
  /** column name */
  RoutineId = 'routine_id'
}

/** input type for updating data in table "event.routine_exception" */
export type Event_Routine_Exception_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  exception_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "event_routine_exception" */
export type Event_Routine_Exception_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Routine_Exception_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Routine_Exception_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['uuid']['input']>;
  exception_date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  routine_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "event.routine_exception" */
export enum Event_Routine_Exception_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  ExceptionDate = 'exception_date',
  /** column name */
  Id = 'id',
  /** column name */
  Reason = 'reason',
  /** column name */
  RoutineId = 'routine_id'
}

export type Event_Routine_Exception_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Routine_Exception_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Routine_Exception_Bool_Exp;
};

/** input type for incrementing numeric columns in table "event.routine" */
export type Event_Routine_Inc_Input = {
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "event.routine" */
export type Event_Routine_Insert_Input = {
  course_offering?: InputMaybe<Academic_Course_Offering_Obj_Rel_Insert_Input>;
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  effective_from?: InputMaybe<Scalars['date']['input']>;
  effective_to?: InputMaybe<Scalars['date']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Event_Routine_Max_Fields = {
  __typename?: 'event_routine_max_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  day_of_week?: Maybe<Scalars['Int']['output']>;
  effective_from?: Maybe<Scalars['date']['output']>;
  effective_to?: Maybe<Scalars['date']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  event_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Event_Routine_Min_Fields = {
  __typename?: 'event_routine_min_fields';
  course_offering_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  day_of_week?: Maybe<Scalars['Int']['output']>;
  effective_from?: Maybe<Scalars['date']['output']>;
  effective_to?: Maybe<Scalars['date']['output']>;
  end_time?: Maybe<Scalars['timetz']['output']>;
  event_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  start_time?: Maybe<Scalars['timetz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "event.routine" */
export type Event_Routine_Mutation_Response = {
  __typename?: 'event_routine_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Routine>;
};

/** on_conflict condition type for table "event.routine" */
export type Event_Routine_On_Conflict = {
  constraint: Event_Routine_Constraint;
  update_columns?: Array<Event_Routine_Update_Column>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
};

/** Ordering options when selecting data from "event.routine". */
export type Event_Routine_Order_By = {
  course_offering?: InputMaybe<Academic_Course_Offering_Order_By>;
  course_offering_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  day_of_week?: InputMaybe<Order_By>;
  effective_from?: InputMaybe<Order_By>;
  effective_to?: InputMaybe<Order_By>;
  end_time?: InputMaybe<Order_By>;
  event_type?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  start_time?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event.routine */
export type Event_Routine_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Event_Routine_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "event.routine" */
export enum Event_Routine_Select_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DayOfWeek = 'day_of_week',
  /** column name */
  EffectiveFrom = 'effective_from',
  /** column name */
  EffectiveTo = 'effective_to',
  /** column name */
  EndTime = 'end_time',
  /** column name */
  EventType = 'event_type',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Name = 'name',
  /** column name */
  StartTime = 'start_time',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "event.routine" */
export type Event_Routine_Set_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  effective_from?: InputMaybe<Scalars['date']['input']>;
  effective_to?: InputMaybe<Scalars['date']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Event_Routine_Stddev_Fields = {
  __typename?: 'event_routine_stddev_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Event_Routine_Stddev_Pop_Fields = {
  __typename?: 'event_routine_stddev_pop_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Event_Routine_Stddev_Samp_Fields = {
  __typename?: 'event_routine_stddev_samp_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "event_routine" */
export type Event_Routine_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Routine_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Routine_Stream_Cursor_Value_Input = {
  course_offering_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  day_of_week?: InputMaybe<Scalars['Int']['input']>;
  effective_from?: InputMaybe<Scalars['date']['input']>;
  effective_to?: InputMaybe<Scalars['date']['input']>;
  end_time?: InputMaybe<Scalars['timetz']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  start_time?: InputMaybe<Scalars['timetz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Event_Routine_Sum_Fields = {
  __typename?: 'event_routine_sum_fields';
  day_of_week?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "event.routine" */
export enum Event_Routine_Update_Column {
  /** column name */
  CourseOfferingId = 'course_offering_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DayOfWeek = 'day_of_week',
  /** column name */
  EffectiveFrom = 'effective_from',
  /** column name */
  EffectiveTo = 'effective_to',
  /** column name */
  EndTime = 'end_time',
  /** column name */
  EventType = 'event_type',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Name = 'name',
  /** column name */
  StartTime = 'start_time',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Event_Routine_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Event_Routine_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Event_Routine_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Event_Routine_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Event_Routine_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Event_Routine_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Event_Routine_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Routine_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Routine_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Event_Routine_Var_Pop_Fields = {
  __typename?: 'event_routine_var_pop_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Event_Routine_Var_Samp_Fields = {
  __typename?: 'event_routine_var_samp_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Event_Routine_Variance_Fields = {
  __typename?: 'event_routine_variance_fields';
  day_of_week?: Maybe<Scalars['Float']['output']>;
};

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
  /** delete data from the table: "academic.batch" */
  delete_academic_batch?: Maybe<Academic_Batch_Mutation_Response>;
  /** delete single row from the table: "academic.batch" */
  delete_academic_batch_by_pk?: Maybe<Academic_Batch>;
  /** delete data from the table: "academic.class_representative" */
  delete_academic_class_representative?: Maybe<Academic_Class_Representative_Mutation_Response>;
  /** delete single row from the table: "academic.class_representative" */
  delete_academic_class_representative_by_pk?: Maybe<Academic_Class_Representative>;
  /** delete data from the table: "academic.course" */
  delete_academic_course?: Maybe<Academic_Course_Mutation_Response>;
  /** delete single row from the table: "academic.course" */
  delete_academic_course_by_pk?: Maybe<Academic_Course>;
  /** delete data from the table: "academic.course_offering" */
  delete_academic_course_offering?: Maybe<Academic_Course_Offering_Mutation_Response>;
  /** delete single row from the table: "academic.course_offering" */
  delete_academic_course_offering_by_pk?: Maybe<Academic_Course_Offering>;
  /** delete data from the table: "academic.department" */
  delete_academic_department?: Maybe<Academic_Department_Mutation_Response>;
  /** delete single row from the table: "academic.department" */
  delete_academic_department_by_pk?: Maybe<Academic_Department>;
  /** delete data from the table: "academic.faculty" */
  delete_academic_faculty?: Maybe<Academic_Faculty_Mutation_Response>;
  /** delete single row from the table: "academic.faculty" */
  delete_academic_faculty_by_pk?: Maybe<Academic_Faculty>;
  /** delete data from the table: "academic.section" */
  delete_academic_section?: Maybe<Academic_Section_Mutation_Response>;
  /** delete single row from the table: "academic.section" */
  delete_academic_section_by_pk?: Maybe<Academic_Section>;
  /** delete data from the table: "academic.user_enrollment" */
  delete_academic_user_enrollment?: Maybe<Academic_User_Enrollment_Mutation_Response>;
  /** delete single row from the table: "academic.user_enrollment" */
  delete_academic_user_enrollment_by_pk?: Maybe<Academic_User_Enrollment>;
  /** delete data from the table: "event.event" */
  delete_event_event?: Maybe<Event_Event_Mutation_Response>;
  /** delete data from the table: "event.event_attachment" */
  delete_event_event_attachment?: Maybe<Event_Event_Attachment_Mutation_Response>;
  /** delete single row from the table: "event.event_attachment" */
  delete_event_event_attachment_by_pk?: Maybe<Event_Event_Attachment>;
  /** delete data from the table: "event.event_attendance" */
  delete_event_event_attendance?: Maybe<Event_Event_Attendance_Mutation_Response>;
  /** delete single row from the table: "event.event_attendance" */
  delete_event_event_attendance_by_pk?: Maybe<Event_Event_Attendance>;
  /** delete single row from the table: "event.event" */
  delete_event_event_by_pk?: Maybe<Event_Event>;
  /** delete data from the table: "event.event_cancellation" */
  delete_event_event_cancellation?: Maybe<Event_Event_Cancellation_Mutation_Response>;
  /** delete single row from the table: "event.event_cancellation" */
  delete_event_event_cancellation_by_pk?: Maybe<Event_Event_Cancellation>;
  /** delete data from the table: "event.event_change" */
  delete_event_event_change?: Maybe<Event_Event_Change_Mutation_Response>;
  /** delete single row from the table: "event.event_change" */
  delete_event_event_change_by_pk?: Maybe<Event_Event_Change>;
  /** delete data from the table: "event.event_instructor" */
  delete_event_event_instructor?: Maybe<Event_Event_Instructor_Mutation_Response>;
  /** delete single row from the table: "event.event_instructor" */
  delete_event_event_instructor_by_pk?: Maybe<Event_Event_Instructor>;
  /** delete data from the table: "event.event_participant" */
  delete_event_event_participant?: Maybe<Event_Event_Participant_Mutation_Response>;
  /** delete single row from the table: "event.event_participant" */
  delete_event_event_participant_by_pk?: Maybe<Event_Event_Participant>;
  /** delete data from the table: "event.event_room" */
  delete_event_event_room?: Maybe<Event_Event_Room_Mutation_Response>;
  /** delete single row from the table: "event.event_room" */
  delete_event_event_room_by_pk?: Maybe<Event_Event_Room>;
  /** delete data from the table: "event.event_target" */
  delete_event_event_target?: Maybe<Event_Event_Target_Mutation_Response>;
  /** delete single row from the table: "event.event_target" */
  delete_event_event_target_by_pk?: Maybe<Event_Event_Target>;
  /** delete data from the table: "event.group_assignment" */
  delete_event_group_assignment?: Maybe<Event_Group_Assignment_Mutation_Response>;
  /** delete single row from the table: "event.group_assignment" */
  delete_event_group_assignment_by_pk?: Maybe<Event_Group_Assignment>;
  /** delete data from the table: "event.routine" */
  delete_event_routine?: Maybe<Event_Routine_Mutation_Response>;
  /** delete single row from the table: "event.routine" */
  delete_event_routine_by_pk?: Maybe<Event_Routine>;
  /** delete data from the table: "event.routine_exception" */
  delete_event_routine_exception?: Maybe<Event_Routine_Exception_Mutation_Response>;
  /** delete single row from the table: "event.routine_exception" */
  delete_event_routine_exception_by_pk?: Maybe<Event_Routine_Exception>;
  /** delete data from the table: "settings.config" */
  delete_settings_config?: Maybe<Settings_Config_Mutation_Response>;
  /** delete single row from the table: "settings.config" */
  delete_settings_config_by_pk?: Maybe<Settings_Config>;
  /** delete data from the table: "user.account" */
  delete_user_account?: Maybe<User_Account_Mutation_Response>;
  /** delete single row from the table: "user.account" */
  delete_user_account_by_pk?: Maybe<User_Account>;
  /** delete data from the table: "user.device" */
  delete_user_device?: Maybe<User_Device_Mutation_Response>;
  /** delete single row from the table: "user.device" */
  delete_user_device_by_pk?: Maybe<User_Device>;
  /** delete data from the table: "user.faculty" */
  delete_user_faculty?: Maybe<User_Faculty_Mutation_Response>;
  /** delete single row from the table: "user.faculty" */
  delete_user_faculty_by_pk?: Maybe<User_Faculty>;
  /** delete data from the table: "user.otp_rate_limit" */
  delete_user_otp_rate_limit?: Maybe<User_Otp_Rate_Limit_Mutation_Response>;
  /** delete single row from the table: "user.otp_rate_limit" */
  delete_user_otp_rate_limit_by_pk?: Maybe<User_Otp_Rate_Limit>;
  /** delete data from the table: "user.otp_transaction" */
  delete_user_otp_transaction?: Maybe<User_Otp_Transaction_Mutation_Response>;
  /** delete single row from the table: "user.otp_transaction" */
  delete_user_otp_transaction_by_pk?: Maybe<User_Otp_Transaction>;
  /** delete data from the table: "user.profile" */
  delete_user_profile?: Maybe<User_Profile_Mutation_Response>;
  /** delete single row from the table: "user.profile" */
  delete_user_profile_by_pk?: Maybe<User_Profile>;
  /** delete data from the table: "user.session" */
  delete_user_session?: Maybe<User_Session_Mutation_Response>;
  /** delete single row from the table: "user.session" */
  delete_user_session_by_pk?: Maybe<User_Session>;
  /** delete data from the table: "venue.building" */
  delete_venue_building?: Maybe<Venue_Building_Mutation_Response>;
  /** delete single row from the table: "venue.building" */
  delete_venue_building_by_pk?: Maybe<Venue_Building>;
  /** delete data from the table: "venue.room" */
  delete_venue_room?: Maybe<Venue_Room_Mutation_Response>;
  /** delete single row from the table: "venue.room" */
  delete_venue_room_by_pk?: Maybe<Venue_Room>;
  /** insert data into the table: "academic.batch" */
  insert_academic_batch?: Maybe<Academic_Batch_Mutation_Response>;
  /** insert a single row into the table: "academic.batch" */
  insert_academic_batch_one?: Maybe<Academic_Batch>;
  /** insert data into the table: "academic.class_representative" */
  insert_academic_class_representative?: Maybe<Academic_Class_Representative_Mutation_Response>;
  /** insert a single row into the table: "academic.class_representative" */
  insert_academic_class_representative_one?: Maybe<Academic_Class_Representative>;
  /** insert data into the table: "academic.course" */
  insert_academic_course?: Maybe<Academic_Course_Mutation_Response>;
  /** insert data into the table: "academic.course_offering" */
  insert_academic_course_offering?: Maybe<Academic_Course_Offering_Mutation_Response>;
  /** insert a single row into the table: "academic.course_offering" */
  insert_academic_course_offering_one?: Maybe<Academic_Course_Offering>;
  /** insert a single row into the table: "academic.course" */
  insert_academic_course_one?: Maybe<Academic_Course>;
  /** insert data into the table: "academic.department" */
  insert_academic_department?: Maybe<Academic_Department_Mutation_Response>;
  /** insert a single row into the table: "academic.department" */
  insert_academic_department_one?: Maybe<Academic_Department>;
  /** insert data into the table: "academic.faculty" */
  insert_academic_faculty?: Maybe<Academic_Faculty_Mutation_Response>;
  /** insert a single row into the table: "academic.faculty" */
  insert_academic_faculty_one?: Maybe<Academic_Faculty>;
  /** insert data into the table: "academic.section" */
  insert_academic_section?: Maybe<Academic_Section_Mutation_Response>;
  /** insert a single row into the table: "academic.section" */
  insert_academic_section_one?: Maybe<Academic_Section>;
  /** insert data into the table: "academic.user_enrollment" */
  insert_academic_user_enrollment?: Maybe<Academic_User_Enrollment_Mutation_Response>;
  /** insert a single row into the table: "academic.user_enrollment" */
  insert_academic_user_enrollment_one?: Maybe<Academic_User_Enrollment>;
  /** insert data into the table: "event.event" */
  insert_event_event?: Maybe<Event_Event_Mutation_Response>;
  /** insert data into the table: "event.event_attachment" */
  insert_event_event_attachment?: Maybe<Event_Event_Attachment_Mutation_Response>;
  /** insert a single row into the table: "event.event_attachment" */
  insert_event_event_attachment_one?: Maybe<Event_Event_Attachment>;
  /** insert data into the table: "event.event_attendance" */
  insert_event_event_attendance?: Maybe<Event_Event_Attendance_Mutation_Response>;
  /** insert a single row into the table: "event.event_attendance" */
  insert_event_event_attendance_one?: Maybe<Event_Event_Attendance>;
  /** insert data into the table: "event.event_cancellation" */
  insert_event_event_cancellation?: Maybe<Event_Event_Cancellation_Mutation_Response>;
  /** insert a single row into the table: "event.event_cancellation" */
  insert_event_event_cancellation_one?: Maybe<Event_Event_Cancellation>;
  /** insert data into the table: "event.event_change" */
  insert_event_event_change?: Maybe<Event_Event_Change_Mutation_Response>;
  /** insert a single row into the table: "event.event_change" */
  insert_event_event_change_one?: Maybe<Event_Event_Change>;
  /** insert data into the table: "event.event_instructor" */
  insert_event_event_instructor?: Maybe<Event_Event_Instructor_Mutation_Response>;
  /** insert a single row into the table: "event.event_instructor" */
  insert_event_event_instructor_one?: Maybe<Event_Event_Instructor>;
  /** insert a single row into the table: "event.event" */
  insert_event_event_one?: Maybe<Event_Event>;
  /** insert data into the table: "event.event_participant" */
  insert_event_event_participant?: Maybe<Event_Event_Participant_Mutation_Response>;
  /** insert a single row into the table: "event.event_participant" */
  insert_event_event_participant_one?: Maybe<Event_Event_Participant>;
  /** insert data into the table: "event.event_room" */
  insert_event_event_room?: Maybe<Event_Event_Room_Mutation_Response>;
  /** insert a single row into the table: "event.event_room" */
  insert_event_event_room_one?: Maybe<Event_Event_Room>;
  /** insert data into the table: "event.event_target" */
  insert_event_event_target?: Maybe<Event_Event_Target_Mutation_Response>;
  /** insert a single row into the table: "event.event_target" */
  insert_event_event_target_one?: Maybe<Event_Event_Target>;
  /** insert data into the table: "event.group_assignment" */
  insert_event_group_assignment?: Maybe<Event_Group_Assignment_Mutation_Response>;
  /** insert a single row into the table: "event.group_assignment" */
  insert_event_group_assignment_one?: Maybe<Event_Group_Assignment>;
  /** insert data into the table: "event.routine" */
  insert_event_routine?: Maybe<Event_Routine_Mutation_Response>;
  /** insert data into the table: "event.routine_exception" */
  insert_event_routine_exception?: Maybe<Event_Routine_Exception_Mutation_Response>;
  /** insert a single row into the table: "event.routine_exception" */
  insert_event_routine_exception_one?: Maybe<Event_Routine_Exception>;
  /** insert a single row into the table: "event.routine" */
  insert_event_routine_one?: Maybe<Event_Routine>;
  /** insert data into the table: "settings.config" */
  insert_settings_config?: Maybe<Settings_Config_Mutation_Response>;
  /** insert a single row into the table: "settings.config" */
  insert_settings_config_one?: Maybe<Settings_Config>;
  /** insert data into the table: "user.account" */
  insert_user_account?: Maybe<User_Account_Mutation_Response>;
  /** insert a single row into the table: "user.account" */
  insert_user_account_one?: Maybe<User_Account>;
  /** insert data into the table: "user.device" */
  insert_user_device?: Maybe<User_Device_Mutation_Response>;
  /** insert a single row into the table: "user.device" */
  insert_user_device_one?: Maybe<User_Device>;
  /** insert data into the table: "user.faculty" */
  insert_user_faculty?: Maybe<User_Faculty_Mutation_Response>;
  /** insert a single row into the table: "user.faculty" */
  insert_user_faculty_one?: Maybe<User_Faculty>;
  /** insert data into the table: "user.otp_rate_limit" */
  insert_user_otp_rate_limit?: Maybe<User_Otp_Rate_Limit_Mutation_Response>;
  /** insert a single row into the table: "user.otp_rate_limit" */
  insert_user_otp_rate_limit_one?: Maybe<User_Otp_Rate_Limit>;
  /** insert data into the table: "user.otp_transaction" */
  insert_user_otp_transaction?: Maybe<User_Otp_Transaction_Mutation_Response>;
  /** insert a single row into the table: "user.otp_transaction" */
  insert_user_otp_transaction_one?: Maybe<User_Otp_Transaction>;
  /** insert data into the table: "user.profile" */
  insert_user_profile?: Maybe<User_Profile_Mutation_Response>;
  /** insert a single row into the table: "user.profile" */
  insert_user_profile_one?: Maybe<User_Profile>;
  /** insert data into the table: "user.session" */
  insert_user_session?: Maybe<User_Session_Mutation_Response>;
  /** insert a single row into the table: "user.session" */
  insert_user_session_one?: Maybe<User_Session>;
  /** insert data into the table: "venue.building" */
  insert_venue_building?: Maybe<Venue_Building_Mutation_Response>;
  /** insert a single row into the table: "venue.building" */
  insert_venue_building_one?: Maybe<Venue_Building>;
  /** insert data into the table: "venue.room" */
  insert_venue_room?: Maybe<Venue_Room_Mutation_Response>;
  /** insert a single row into the table: "venue.room" */
  insert_venue_room_one?: Maybe<Venue_Room>;
  sendOTP: ApiResponse;
  /** update data of the table: "academic.batch" */
  update_academic_batch?: Maybe<Academic_Batch_Mutation_Response>;
  /** update single row of the table: "academic.batch" */
  update_academic_batch_by_pk?: Maybe<Academic_Batch>;
  /** update multiples rows of table: "academic.batch" */
  update_academic_batch_many?: Maybe<Array<Maybe<Academic_Batch_Mutation_Response>>>;
  /** update data of the table: "academic.class_representative" */
  update_academic_class_representative?: Maybe<Academic_Class_Representative_Mutation_Response>;
  /** update single row of the table: "academic.class_representative" */
  update_academic_class_representative_by_pk?: Maybe<Academic_Class_Representative>;
  /** update multiples rows of table: "academic.class_representative" */
  update_academic_class_representative_many?: Maybe<Array<Maybe<Academic_Class_Representative_Mutation_Response>>>;
  /** update data of the table: "academic.course" */
  update_academic_course?: Maybe<Academic_Course_Mutation_Response>;
  /** update single row of the table: "academic.course" */
  update_academic_course_by_pk?: Maybe<Academic_Course>;
  /** update multiples rows of table: "academic.course" */
  update_academic_course_many?: Maybe<Array<Maybe<Academic_Course_Mutation_Response>>>;
  /** update data of the table: "academic.course_offering" */
  update_academic_course_offering?: Maybe<Academic_Course_Offering_Mutation_Response>;
  /** update single row of the table: "academic.course_offering" */
  update_academic_course_offering_by_pk?: Maybe<Academic_Course_Offering>;
  /** update multiples rows of table: "academic.course_offering" */
  update_academic_course_offering_many?: Maybe<Array<Maybe<Academic_Course_Offering_Mutation_Response>>>;
  /** update data of the table: "academic.department" */
  update_academic_department?: Maybe<Academic_Department_Mutation_Response>;
  /** update single row of the table: "academic.department" */
  update_academic_department_by_pk?: Maybe<Academic_Department>;
  /** update multiples rows of table: "academic.department" */
  update_academic_department_many?: Maybe<Array<Maybe<Academic_Department_Mutation_Response>>>;
  /** update data of the table: "academic.faculty" */
  update_academic_faculty?: Maybe<Academic_Faculty_Mutation_Response>;
  /** update single row of the table: "academic.faculty" */
  update_academic_faculty_by_pk?: Maybe<Academic_Faculty>;
  /** update multiples rows of table: "academic.faculty" */
  update_academic_faculty_many?: Maybe<Array<Maybe<Academic_Faculty_Mutation_Response>>>;
  /** update data of the table: "academic.section" */
  update_academic_section?: Maybe<Academic_Section_Mutation_Response>;
  /** update single row of the table: "academic.section" */
  update_academic_section_by_pk?: Maybe<Academic_Section>;
  /** update multiples rows of table: "academic.section" */
  update_academic_section_many?: Maybe<Array<Maybe<Academic_Section_Mutation_Response>>>;
  /** update data of the table: "academic.user_enrollment" */
  update_academic_user_enrollment?: Maybe<Academic_User_Enrollment_Mutation_Response>;
  /** update single row of the table: "academic.user_enrollment" */
  update_academic_user_enrollment_by_pk?: Maybe<Academic_User_Enrollment>;
  /** update multiples rows of table: "academic.user_enrollment" */
  update_academic_user_enrollment_many?: Maybe<Array<Maybe<Academic_User_Enrollment_Mutation_Response>>>;
  /** update data of the table: "event.event" */
  update_event_event?: Maybe<Event_Event_Mutation_Response>;
  /** update data of the table: "event.event_attachment" */
  update_event_event_attachment?: Maybe<Event_Event_Attachment_Mutation_Response>;
  /** update single row of the table: "event.event_attachment" */
  update_event_event_attachment_by_pk?: Maybe<Event_Event_Attachment>;
  /** update multiples rows of table: "event.event_attachment" */
  update_event_event_attachment_many?: Maybe<Array<Maybe<Event_Event_Attachment_Mutation_Response>>>;
  /** update data of the table: "event.event_attendance" */
  update_event_event_attendance?: Maybe<Event_Event_Attendance_Mutation_Response>;
  /** update single row of the table: "event.event_attendance" */
  update_event_event_attendance_by_pk?: Maybe<Event_Event_Attendance>;
  /** update multiples rows of table: "event.event_attendance" */
  update_event_event_attendance_many?: Maybe<Array<Maybe<Event_Event_Attendance_Mutation_Response>>>;
  /** update single row of the table: "event.event" */
  update_event_event_by_pk?: Maybe<Event_Event>;
  /** update data of the table: "event.event_cancellation" */
  update_event_event_cancellation?: Maybe<Event_Event_Cancellation_Mutation_Response>;
  /** update single row of the table: "event.event_cancellation" */
  update_event_event_cancellation_by_pk?: Maybe<Event_Event_Cancellation>;
  /** update multiples rows of table: "event.event_cancellation" */
  update_event_event_cancellation_many?: Maybe<Array<Maybe<Event_Event_Cancellation_Mutation_Response>>>;
  /** update data of the table: "event.event_change" */
  update_event_event_change?: Maybe<Event_Event_Change_Mutation_Response>;
  /** update single row of the table: "event.event_change" */
  update_event_event_change_by_pk?: Maybe<Event_Event_Change>;
  /** update multiples rows of table: "event.event_change" */
  update_event_event_change_many?: Maybe<Array<Maybe<Event_Event_Change_Mutation_Response>>>;
  /** update data of the table: "event.event_instructor" */
  update_event_event_instructor?: Maybe<Event_Event_Instructor_Mutation_Response>;
  /** update single row of the table: "event.event_instructor" */
  update_event_event_instructor_by_pk?: Maybe<Event_Event_Instructor>;
  /** update multiples rows of table: "event.event_instructor" */
  update_event_event_instructor_many?: Maybe<Array<Maybe<Event_Event_Instructor_Mutation_Response>>>;
  /** update multiples rows of table: "event.event" */
  update_event_event_many?: Maybe<Array<Maybe<Event_Event_Mutation_Response>>>;
  /** update data of the table: "event.event_participant" */
  update_event_event_participant?: Maybe<Event_Event_Participant_Mutation_Response>;
  /** update single row of the table: "event.event_participant" */
  update_event_event_participant_by_pk?: Maybe<Event_Event_Participant>;
  /** update multiples rows of table: "event.event_participant" */
  update_event_event_participant_many?: Maybe<Array<Maybe<Event_Event_Participant_Mutation_Response>>>;
  /** update data of the table: "event.event_room" */
  update_event_event_room?: Maybe<Event_Event_Room_Mutation_Response>;
  /** update single row of the table: "event.event_room" */
  update_event_event_room_by_pk?: Maybe<Event_Event_Room>;
  /** update multiples rows of table: "event.event_room" */
  update_event_event_room_many?: Maybe<Array<Maybe<Event_Event_Room_Mutation_Response>>>;
  /** update data of the table: "event.event_target" */
  update_event_event_target?: Maybe<Event_Event_Target_Mutation_Response>;
  /** update single row of the table: "event.event_target" */
  update_event_event_target_by_pk?: Maybe<Event_Event_Target>;
  /** update multiples rows of table: "event.event_target" */
  update_event_event_target_many?: Maybe<Array<Maybe<Event_Event_Target_Mutation_Response>>>;
  /** update data of the table: "event.group_assignment" */
  update_event_group_assignment?: Maybe<Event_Group_Assignment_Mutation_Response>;
  /** update single row of the table: "event.group_assignment" */
  update_event_group_assignment_by_pk?: Maybe<Event_Group_Assignment>;
  /** update multiples rows of table: "event.group_assignment" */
  update_event_group_assignment_many?: Maybe<Array<Maybe<Event_Group_Assignment_Mutation_Response>>>;
  /** update data of the table: "event.routine" */
  update_event_routine?: Maybe<Event_Routine_Mutation_Response>;
  /** update single row of the table: "event.routine" */
  update_event_routine_by_pk?: Maybe<Event_Routine>;
  /** update data of the table: "event.routine_exception" */
  update_event_routine_exception?: Maybe<Event_Routine_Exception_Mutation_Response>;
  /** update single row of the table: "event.routine_exception" */
  update_event_routine_exception_by_pk?: Maybe<Event_Routine_Exception>;
  /** update multiples rows of table: "event.routine_exception" */
  update_event_routine_exception_many?: Maybe<Array<Maybe<Event_Routine_Exception_Mutation_Response>>>;
  /** update multiples rows of table: "event.routine" */
  update_event_routine_many?: Maybe<Array<Maybe<Event_Routine_Mutation_Response>>>;
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
  /** update data of the table: "user.device" */
  update_user_device?: Maybe<User_Device_Mutation_Response>;
  /** update single row of the table: "user.device" */
  update_user_device_by_pk?: Maybe<User_Device>;
  /** update multiples rows of table: "user.device" */
  update_user_device_many?: Maybe<Array<Maybe<User_Device_Mutation_Response>>>;
  /** update data of the table: "user.faculty" */
  update_user_faculty?: Maybe<User_Faculty_Mutation_Response>;
  /** update single row of the table: "user.faculty" */
  update_user_faculty_by_pk?: Maybe<User_Faculty>;
  /** update multiples rows of table: "user.faculty" */
  update_user_faculty_many?: Maybe<Array<Maybe<User_Faculty_Mutation_Response>>>;
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
  /** update data of the table: "user.profile" */
  update_user_profile?: Maybe<User_Profile_Mutation_Response>;
  /** update single row of the table: "user.profile" */
  update_user_profile_by_pk?: Maybe<User_Profile>;
  /** update multiples rows of table: "user.profile" */
  update_user_profile_many?: Maybe<Array<Maybe<User_Profile_Mutation_Response>>>;
  /** update data of the table: "user.session" */
  update_user_session?: Maybe<User_Session_Mutation_Response>;
  /** update single row of the table: "user.session" */
  update_user_session_by_pk?: Maybe<User_Session>;
  /** update multiples rows of table: "user.session" */
  update_user_session_many?: Maybe<Array<Maybe<User_Session_Mutation_Response>>>;
  /** update data of the table: "venue.building" */
  update_venue_building?: Maybe<Venue_Building_Mutation_Response>;
  /** update single row of the table: "venue.building" */
  update_venue_building_by_pk?: Maybe<Venue_Building>;
  /** update multiples rows of table: "venue.building" */
  update_venue_building_many?: Maybe<Array<Maybe<Venue_Building_Mutation_Response>>>;
  /** update data of the table: "venue.room" */
  update_venue_room?: Maybe<Venue_Room_Mutation_Response>;
  /** update single row of the table: "venue.room" */
  update_venue_room_by_pk?: Maybe<Venue_Room>;
  /** update multiples rows of table: "venue.room" */
  update_venue_room_many?: Maybe<Array<Maybe<Venue_Room_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Academic_BatchArgs = {
  where: Academic_Batch_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Batch_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_Class_RepresentativeArgs = {
  where: Academic_Class_Representative_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Class_Representative_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_CourseArgs = {
  where: Academic_Course_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Course_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_Course_OfferingArgs = {
  where: Academic_Course_Offering_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Course_Offering_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_DepartmentArgs = {
  where: Academic_Department_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Department_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_FacultyArgs = {
  where: Academic_Faculty_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Faculty_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_SectionArgs = {
  where: Academic_Section_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_Section_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Academic_User_EnrollmentArgs = {
  where: Academic_User_Enrollment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Academic_User_Enrollment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_EventArgs = {
  where: Event_Event_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_AttachmentArgs = {
  where: Event_Event_Attachment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Attachment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_AttendanceArgs = {
  where: Event_Event_Attendance_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Attendance_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_CancellationArgs = {
  where: Event_Event_Cancellation_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Cancellation_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_ChangeArgs = {
  where: Event_Event_Change_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Change_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_InstructorArgs = {
  where: Event_Event_Instructor_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Instructor_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_ParticipantArgs = {
  where: Event_Event_Participant_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Participant_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_RoomArgs = {
  where: Event_Event_Room_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Room_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_TargetArgs = {
  where: Event_Event_Target_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Event_Target_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Group_AssignmentArgs = {
  where: Event_Group_Assignment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Group_Assignment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_RoutineArgs = {
  where: Event_Routine_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Routine_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_Routine_ExceptionArgs = {
  where: Event_Routine_Exception_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Routine_Exception_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
export type Mutation_RootDelete_User_DeviceArgs = {
  where: User_Device_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_FacultyArgs = {
  where: User_Faculty_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Faculty_By_PkArgs = {
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
export type Mutation_RootDelete_User_ProfileArgs = {
  where: User_Profile_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Profile_By_PkArgs = {
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
export type Mutation_RootDelete_Venue_BuildingArgs = {
  where: Venue_Building_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Building_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_RoomArgs = {
  where: Venue_Room_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Room_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_Academic_BatchArgs = {
  objects: Array<Academic_Batch_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Batch_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Batch_OneArgs = {
  object: Academic_Batch_Insert_Input;
  on_conflict?: InputMaybe<Academic_Batch_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Class_RepresentativeArgs = {
  objects: Array<Academic_Class_Representative_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Class_Representative_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Class_Representative_OneArgs = {
  object: Academic_Class_Representative_Insert_Input;
  on_conflict?: InputMaybe<Academic_Class_Representative_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_CourseArgs = {
  objects: Array<Academic_Course_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Course_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Course_OfferingArgs = {
  objects: Array<Academic_Course_Offering_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Course_Offering_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Course_Offering_OneArgs = {
  object: Academic_Course_Offering_Insert_Input;
  on_conflict?: InputMaybe<Academic_Course_Offering_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Course_OneArgs = {
  object: Academic_Course_Insert_Input;
  on_conflict?: InputMaybe<Academic_Course_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_DepartmentArgs = {
  objects: Array<Academic_Department_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Department_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Department_OneArgs = {
  object: Academic_Department_Insert_Input;
  on_conflict?: InputMaybe<Academic_Department_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_FacultyArgs = {
  objects: Array<Academic_Faculty_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Faculty_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Faculty_OneArgs = {
  object: Academic_Faculty_Insert_Input;
  on_conflict?: InputMaybe<Academic_Faculty_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_SectionArgs = {
  objects: Array<Academic_Section_Insert_Input>;
  on_conflict?: InputMaybe<Academic_Section_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_Section_OneArgs = {
  object: Academic_Section_Insert_Input;
  on_conflict?: InputMaybe<Academic_Section_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_User_EnrollmentArgs = {
  objects: Array<Academic_User_Enrollment_Insert_Input>;
  on_conflict?: InputMaybe<Academic_User_Enrollment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Academic_User_Enrollment_OneArgs = {
  object: Academic_User_Enrollment_Insert_Input;
  on_conflict?: InputMaybe<Academic_User_Enrollment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_EventArgs = {
  objects: Array<Event_Event_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_AttachmentArgs = {
  objects: Array<Event_Event_Attachment_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Attachment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Attachment_OneArgs = {
  object: Event_Event_Attachment_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Attachment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_AttendanceArgs = {
  objects: Array<Event_Event_Attendance_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Attendance_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Attendance_OneArgs = {
  object: Event_Event_Attendance_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Attendance_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_CancellationArgs = {
  objects: Array<Event_Event_Cancellation_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Cancellation_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Cancellation_OneArgs = {
  object: Event_Event_Cancellation_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Cancellation_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_ChangeArgs = {
  objects: Array<Event_Event_Change_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Change_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Change_OneArgs = {
  object: Event_Event_Change_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Change_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_InstructorArgs = {
  objects: Array<Event_Event_Instructor_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Instructor_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Instructor_OneArgs = {
  object: Event_Event_Instructor_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Instructor_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_OneArgs = {
  object: Event_Event_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_ParticipantArgs = {
  objects: Array<Event_Event_Participant_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Participant_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Participant_OneArgs = {
  object: Event_Event_Participant_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Participant_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_RoomArgs = {
  objects: Array<Event_Event_Room_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Room_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Room_OneArgs = {
  object: Event_Event_Room_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Room_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_TargetArgs = {
  objects: Array<Event_Event_Target_Insert_Input>;
  on_conflict?: InputMaybe<Event_Event_Target_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Event_Target_OneArgs = {
  object: Event_Event_Target_Insert_Input;
  on_conflict?: InputMaybe<Event_Event_Target_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Group_AssignmentArgs = {
  objects: Array<Event_Group_Assignment_Insert_Input>;
  on_conflict?: InputMaybe<Event_Group_Assignment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Group_Assignment_OneArgs = {
  object: Event_Group_Assignment_Insert_Input;
  on_conflict?: InputMaybe<Event_Group_Assignment_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_RoutineArgs = {
  objects: Array<Event_Routine_Insert_Input>;
  on_conflict?: InputMaybe<Event_Routine_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Routine_ExceptionArgs = {
  objects: Array<Event_Routine_Exception_Insert_Input>;
  on_conflict?: InputMaybe<Event_Routine_Exception_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Routine_Exception_OneArgs = {
  object: Event_Routine_Exception_Insert_Input;
  on_conflict?: InputMaybe<Event_Routine_Exception_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Routine_OneArgs = {
  object: Event_Routine_Insert_Input;
  on_conflict?: InputMaybe<Event_Routine_On_Conflict>;
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
export type Mutation_RootInsert_User_DeviceArgs = {
  objects: Array<User_Device_Insert_Input>;
  on_conflict?: InputMaybe<User_Device_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Device_OneArgs = {
  object: User_Device_Insert_Input;
  on_conflict?: InputMaybe<User_Device_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_FacultyArgs = {
  objects: Array<User_Faculty_Insert_Input>;
  on_conflict?: InputMaybe<User_Faculty_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Faculty_OneArgs = {
  object: User_Faculty_Insert_Input;
  on_conflict?: InputMaybe<User_Faculty_On_Conflict>;
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
export type Mutation_RootInsert_User_ProfileArgs = {
  objects: Array<User_Profile_Insert_Input>;
  on_conflict?: InputMaybe<User_Profile_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Profile_OneArgs = {
  object: User_Profile_Insert_Input;
  on_conflict?: InputMaybe<User_Profile_On_Conflict>;
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
export type Mutation_RootInsert_Venue_BuildingArgs = {
  objects: Array<Venue_Building_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Building_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Building_OneArgs = {
  object: Venue_Building_Insert_Input;
  on_conflict?: InputMaybe<Venue_Building_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_RoomArgs = {
  objects: Array<Venue_Room_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Room_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Room_OneArgs = {
  object: Venue_Room_Insert_Input;
  on_conflict?: InputMaybe<Venue_Room_On_Conflict>;
};


/** mutation root */
export type Mutation_RootSendOtpArgs = {
  identifier: Scalars['String']['input'];
  identifierType: IdentifierTypeEnum;
  purpose: OtpPurposeEnum;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_BatchArgs = {
  _inc?: InputMaybe<Academic_Batch_Inc_Input>;
  _set?: InputMaybe<Academic_Batch_Set_Input>;
  where: Academic_Batch_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Batch_By_PkArgs = {
  _inc?: InputMaybe<Academic_Batch_Inc_Input>;
  _set?: InputMaybe<Academic_Batch_Set_Input>;
  pk_columns: Academic_Batch_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Batch_ManyArgs = {
  updates: Array<Academic_Batch_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Class_RepresentativeArgs = {
  _set?: InputMaybe<Academic_Class_Representative_Set_Input>;
  where: Academic_Class_Representative_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Class_Representative_By_PkArgs = {
  _set?: InputMaybe<Academic_Class_Representative_Set_Input>;
  pk_columns: Academic_Class_Representative_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Class_Representative_ManyArgs = {
  updates: Array<Academic_Class_Representative_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_CourseArgs = {
  _inc?: InputMaybe<Academic_Course_Inc_Input>;
  _set?: InputMaybe<Academic_Course_Set_Input>;
  where: Academic_Course_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Course_By_PkArgs = {
  _inc?: InputMaybe<Academic_Course_Inc_Input>;
  _set?: InputMaybe<Academic_Course_Set_Input>;
  pk_columns: Academic_Course_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Course_ManyArgs = {
  updates: Array<Academic_Course_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Course_OfferingArgs = {
  _set?: InputMaybe<Academic_Course_Offering_Set_Input>;
  where: Academic_Course_Offering_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Course_Offering_By_PkArgs = {
  _set?: InputMaybe<Academic_Course_Offering_Set_Input>;
  pk_columns: Academic_Course_Offering_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Course_Offering_ManyArgs = {
  updates: Array<Academic_Course_Offering_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_DepartmentArgs = {
  _set?: InputMaybe<Academic_Department_Set_Input>;
  where: Academic_Department_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Department_By_PkArgs = {
  _set?: InputMaybe<Academic_Department_Set_Input>;
  pk_columns: Academic_Department_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Department_ManyArgs = {
  updates: Array<Academic_Department_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_FacultyArgs = {
  _set?: InputMaybe<Academic_Faculty_Set_Input>;
  where: Academic_Faculty_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Faculty_By_PkArgs = {
  _set?: InputMaybe<Academic_Faculty_Set_Input>;
  pk_columns: Academic_Faculty_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Faculty_ManyArgs = {
  updates: Array<Academic_Faculty_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_SectionArgs = {
  _inc?: InputMaybe<Academic_Section_Inc_Input>;
  _set?: InputMaybe<Academic_Section_Set_Input>;
  where: Academic_Section_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Section_By_PkArgs = {
  _inc?: InputMaybe<Academic_Section_Inc_Input>;
  _set?: InputMaybe<Academic_Section_Set_Input>;
  pk_columns: Academic_Section_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_Section_ManyArgs = {
  updates: Array<Academic_Section_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_User_EnrollmentArgs = {
  _set?: InputMaybe<Academic_User_Enrollment_Set_Input>;
  where: Academic_User_Enrollment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_User_Enrollment_By_PkArgs = {
  _set?: InputMaybe<Academic_User_Enrollment_Set_Input>;
  pk_columns: Academic_User_Enrollment_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Academic_User_Enrollment_ManyArgs = {
  updates: Array<Academic_User_Enrollment_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_EventArgs = {
  _append?: InputMaybe<Event_Event_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Event_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Event_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Event_Delete_Key_Input>;
  _prepend?: InputMaybe<Event_Event_Prepend_Input>;
  _set?: InputMaybe<Event_Event_Set_Input>;
  where: Event_Event_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_AttachmentArgs = {
  _inc?: InputMaybe<Event_Event_Attachment_Inc_Input>;
  _set?: InputMaybe<Event_Event_Attachment_Set_Input>;
  where: Event_Event_Attachment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Attachment_By_PkArgs = {
  _inc?: InputMaybe<Event_Event_Attachment_Inc_Input>;
  _set?: InputMaybe<Event_Event_Attachment_Set_Input>;
  pk_columns: Event_Event_Attachment_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Attachment_ManyArgs = {
  updates: Array<Event_Event_Attachment_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_AttendanceArgs = {
  _set?: InputMaybe<Event_Event_Attendance_Set_Input>;
  where: Event_Event_Attendance_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Attendance_By_PkArgs = {
  _set?: InputMaybe<Event_Event_Attendance_Set_Input>;
  pk_columns: Event_Event_Attendance_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Attendance_ManyArgs = {
  updates: Array<Event_Event_Attendance_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_By_PkArgs = {
  _append?: InputMaybe<Event_Event_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Event_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Event_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Event_Delete_Key_Input>;
  _prepend?: InputMaybe<Event_Event_Prepend_Input>;
  _set?: InputMaybe<Event_Event_Set_Input>;
  pk_columns: Event_Event_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_CancellationArgs = {
  _set?: InputMaybe<Event_Event_Cancellation_Set_Input>;
  where: Event_Event_Cancellation_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Cancellation_By_PkArgs = {
  _set?: InputMaybe<Event_Event_Cancellation_Set_Input>;
  pk_columns: Event_Event_Cancellation_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Cancellation_ManyArgs = {
  updates: Array<Event_Event_Cancellation_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_ChangeArgs = {
  _append?: InputMaybe<Event_Event_Change_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Event_Change_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Event_Change_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Event_Change_Delete_Key_Input>;
  _prepend?: InputMaybe<Event_Event_Change_Prepend_Input>;
  _set?: InputMaybe<Event_Event_Change_Set_Input>;
  where: Event_Event_Change_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Change_By_PkArgs = {
  _append?: InputMaybe<Event_Event_Change_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Event_Change_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Event_Change_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Event_Change_Delete_Key_Input>;
  _prepend?: InputMaybe<Event_Event_Change_Prepend_Input>;
  _set?: InputMaybe<Event_Event_Change_Set_Input>;
  pk_columns: Event_Event_Change_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Change_ManyArgs = {
  updates: Array<Event_Event_Change_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_InstructorArgs = {
  _set?: InputMaybe<Event_Event_Instructor_Set_Input>;
  where: Event_Event_Instructor_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Instructor_By_PkArgs = {
  _set?: InputMaybe<Event_Event_Instructor_Set_Input>;
  pk_columns: Event_Event_Instructor_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Instructor_ManyArgs = {
  updates: Array<Event_Event_Instructor_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_ManyArgs = {
  updates: Array<Event_Event_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_ParticipantArgs = {
  _set?: InputMaybe<Event_Event_Participant_Set_Input>;
  where: Event_Event_Participant_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Participant_By_PkArgs = {
  _set?: InputMaybe<Event_Event_Participant_Set_Input>;
  pk_columns: Event_Event_Participant_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Participant_ManyArgs = {
  updates: Array<Event_Event_Participant_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_RoomArgs = {
  _inc?: InputMaybe<Event_Event_Room_Inc_Input>;
  _set?: InputMaybe<Event_Event_Room_Set_Input>;
  where: Event_Event_Room_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Room_By_PkArgs = {
  _inc?: InputMaybe<Event_Event_Room_Inc_Input>;
  _set?: InputMaybe<Event_Event_Room_Set_Input>;
  pk_columns: Event_Event_Room_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Room_ManyArgs = {
  updates: Array<Event_Event_Room_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_TargetArgs = {
  _set?: InputMaybe<Event_Event_Target_Set_Input>;
  where: Event_Event_Target_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Target_By_PkArgs = {
  _set?: InputMaybe<Event_Event_Target_Set_Input>;
  pk_columns: Event_Event_Target_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Event_Target_ManyArgs = {
  updates: Array<Event_Event_Target_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Group_AssignmentArgs = {
  _set?: InputMaybe<Event_Group_Assignment_Set_Input>;
  where: Event_Group_Assignment_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Group_Assignment_By_PkArgs = {
  _set?: InputMaybe<Event_Group_Assignment_Set_Input>;
  pk_columns: Event_Group_Assignment_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Group_Assignment_ManyArgs = {
  updates: Array<Event_Group_Assignment_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_RoutineArgs = {
  _append?: InputMaybe<Event_Routine_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Routine_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Routine_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Routine_Delete_Key_Input>;
  _inc?: InputMaybe<Event_Routine_Inc_Input>;
  _prepend?: InputMaybe<Event_Routine_Prepend_Input>;
  _set?: InputMaybe<Event_Routine_Set_Input>;
  where: Event_Routine_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Routine_By_PkArgs = {
  _append?: InputMaybe<Event_Routine_Append_Input>;
  _delete_at_path?: InputMaybe<Event_Routine_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Event_Routine_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Event_Routine_Delete_Key_Input>;
  _inc?: InputMaybe<Event_Routine_Inc_Input>;
  _prepend?: InputMaybe<Event_Routine_Prepend_Input>;
  _set?: InputMaybe<Event_Routine_Set_Input>;
  pk_columns: Event_Routine_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Routine_ExceptionArgs = {
  _set?: InputMaybe<Event_Routine_Exception_Set_Input>;
  where: Event_Routine_Exception_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Routine_Exception_By_PkArgs = {
  _set?: InputMaybe<Event_Routine_Exception_Set_Input>;
  pk_columns: Event_Routine_Exception_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Routine_Exception_ManyArgs = {
  updates: Array<Event_Routine_Exception_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Routine_ManyArgs = {
  updates: Array<Event_Routine_Updates>;
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
export type Mutation_RootUpdate_User_DeviceArgs = {
  _set?: InputMaybe<User_Device_Set_Input>;
  where: User_Device_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Device_By_PkArgs = {
  _set?: InputMaybe<User_Device_Set_Input>;
  pk_columns: User_Device_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Device_ManyArgs = {
  updates: Array<User_Device_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_FacultyArgs = {
  _append?: InputMaybe<User_Faculty_Append_Input>;
  _delete_at_path?: InputMaybe<User_Faculty_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Faculty_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Faculty_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Faculty_Prepend_Input>;
  _set?: InputMaybe<User_Faculty_Set_Input>;
  where: User_Faculty_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Faculty_By_PkArgs = {
  _append?: InputMaybe<User_Faculty_Append_Input>;
  _delete_at_path?: InputMaybe<User_Faculty_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Faculty_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Faculty_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Faculty_Prepend_Input>;
  _set?: InputMaybe<User_Faculty_Set_Input>;
  pk_columns: User_Faculty_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Faculty_ManyArgs = {
  updates: Array<User_Faculty_Updates>;
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
export type Mutation_RootUpdate_User_ProfileArgs = {
  _set?: InputMaybe<User_Profile_Set_Input>;
  where: User_Profile_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Profile_By_PkArgs = {
  _set?: InputMaybe<User_Profile_Set_Input>;
  pk_columns: User_Profile_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Profile_ManyArgs = {
  updates: Array<User_Profile_Updates>;
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


/** mutation root */
export type Mutation_RootUpdate_Venue_BuildingArgs = {
  _set?: InputMaybe<Venue_Building_Set_Input>;
  where: Venue_Building_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Building_By_PkArgs = {
  _set?: InputMaybe<Venue_Building_Set_Input>;
  pk_columns: Venue_Building_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Building_ManyArgs = {
  updates: Array<Venue_Building_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_RoomArgs = {
  _append?: InputMaybe<Venue_Room_Append_Input>;
  _delete_at_path?: InputMaybe<Venue_Room_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Venue_Room_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Venue_Room_Delete_Key_Input>;
  _inc?: InputMaybe<Venue_Room_Inc_Input>;
  _prepend?: InputMaybe<Venue_Room_Prepend_Input>;
  _set?: InputMaybe<Venue_Room_Set_Input>;
  where: Venue_Room_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Room_By_PkArgs = {
  _append?: InputMaybe<Venue_Room_Append_Input>;
  _delete_at_path?: InputMaybe<Venue_Room_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Venue_Room_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Venue_Room_Delete_Key_Input>;
  _inc?: InputMaybe<Venue_Room_Inc_Input>;
  _prepend?: InputMaybe<Venue_Room_Prepend_Input>;
  _set?: InputMaybe<Venue_Room_Set_Input>;
  pk_columns: Venue_Room_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Room_ManyArgs = {
  updates: Array<Venue_Room_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
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
  /** fetch data from the table: "academic.batch" */
  academic_batch: Array<Academic_Batch>;
  /** fetch aggregated fields from the table: "academic.batch" */
  academic_batch_aggregate: Academic_Batch_Aggregate;
  /** fetch data from the table: "academic.batch" using primary key columns */
  academic_batch_by_pk?: Maybe<Academic_Batch>;
  /** fetch data from the table: "academic.class_representative" */
  academic_class_representative: Array<Academic_Class_Representative>;
  /** fetch aggregated fields from the table: "academic.class_representative" */
  academic_class_representative_aggregate: Academic_Class_Representative_Aggregate;
  /** fetch data from the table: "academic.class_representative" using primary key columns */
  academic_class_representative_by_pk?: Maybe<Academic_Class_Representative>;
  /** fetch data from the table: "academic.course" */
  academic_course: Array<Academic_Course>;
  /** fetch aggregated fields from the table: "academic.course" */
  academic_course_aggregate: Academic_Course_Aggregate;
  /** fetch data from the table: "academic.course" using primary key columns */
  academic_course_by_pk?: Maybe<Academic_Course>;
  /** fetch data from the table: "academic.course_offering" */
  academic_course_offering: Array<Academic_Course_Offering>;
  /** fetch aggregated fields from the table: "academic.course_offering" */
  academic_course_offering_aggregate: Academic_Course_Offering_Aggregate;
  /** fetch data from the table: "academic.course_offering" using primary key columns */
  academic_course_offering_by_pk?: Maybe<Academic_Course_Offering>;
  /** fetch data from the table: "academic.department" */
  academic_department: Array<Academic_Department>;
  /** fetch aggregated fields from the table: "academic.department" */
  academic_department_aggregate: Academic_Department_Aggregate;
  /** fetch data from the table: "academic.department" using primary key columns */
  academic_department_by_pk?: Maybe<Academic_Department>;
  /** fetch data from the table: "academic.faculty" */
  academic_faculty: Array<Academic_Faculty>;
  /** fetch aggregated fields from the table: "academic.faculty" */
  academic_faculty_aggregate: Academic_Faculty_Aggregate;
  /** fetch data from the table: "academic.faculty" using primary key columns */
  academic_faculty_by_pk?: Maybe<Academic_Faculty>;
  /** fetch data from the table: "academic.section" */
  academic_section: Array<Academic_Section>;
  /** fetch aggregated fields from the table: "academic.section" */
  academic_section_aggregate: Academic_Section_Aggregate;
  /** fetch data from the table: "academic.section" using primary key columns */
  academic_section_by_pk?: Maybe<Academic_Section>;
  /** fetch data from the table: "academic.user_enrollment" */
  academic_user_enrollment: Array<Academic_User_Enrollment>;
  /** fetch aggregated fields from the table: "academic.user_enrollment" */
  academic_user_enrollment_aggregate: Academic_User_Enrollment_Aggregate;
  /** fetch data from the table: "academic.user_enrollment" using primary key columns */
  academic_user_enrollment_by_pk?: Maybe<Academic_User_Enrollment>;
  /** fetch data from the table: "event.event" */
  event_event: Array<Event_Event>;
  /** fetch aggregated fields from the table: "event.event" */
  event_event_aggregate: Event_Event_Aggregate;
  /** fetch data from the table: "event.event_attachment" */
  event_event_attachment: Array<Event_Event_Attachment>;
  /** fetch aggregated fields from the table: "event.event_attachment" */
  event_event_attachment_aggregate: Event_Event_Attachment_Aggregate;
  /** fetch data from the table: "event.event_attachment" using primary key columns */
  event_event_attachment_by_pk?: Maybe<Event_Event_Attachment>;
  /** fetch data from the table: "event.event_attendance" */
  event_event_attendance: Array<Event_Event_Attendance>;
  /** fetch aggregated fields from the table: "event.event_attendance" */
  event_event_attendance_aggregate: Event_Event_Attendance_Aggregate;
  /** fetch data from the table: "event.event_attendance" using primary key columns */
  event_event_attendance_by_pk?: Maybe<Event_Event_Attendance>;
  /** fetch data from the table: "event.event" using primary key columns */
  event_event_by_pk?: Maybe<Event_Event>;
  /** fetch data from the table: "event.event_cancellation" */
  event_event_cancellation: Array<Event_Event_Cancellation>;
  /** fetch aggregated fields from the table: "event.event_cancellation" */
  event_event_cancellation_aggregate: Event_Event_Cancellation_Aggregate;
  /** fetch data from the table: "event.event_cancellation" using primary key columns */
  event_event_cancellation_by_pk?: Maybe<Event_Event_Cancellation>;
  /** fetch data from the table: "event.event_change" */
  event_event_change: Array<Event_Event_Change>;
  /** fetch aggregated fields from the table: "event.event_change" */
  event_event_change_aggregate: Event_Event_Change_Aggregate;
  /** fetch data from the table: "event.event_change" using primary key columns */
  event_event_change_by_pk?: Maybe<Event_Event_Change>;
  /** fetch data from the table: "event.event_instructor" */
  event_event_instructor: Array<Event_Event_Instructor>;
  /** fetch aggregated fields from the table: "event.event_instructor" */
  event_event_instructor_aggregate: Event_Event_Instructor_Aggregate;
  /** fetch data from the table: "event.event_instructor" using primary key columns */
  event_event_instructor_by_pk?: Maybe<Event_Event_Instructor>;
  /** fetch data from the table: "event.event_participant" */
  event_event_participant: Array<Event_Event_Participant>;
  /** fetch aggregated fields from the table: "event.event_participant" */
  event_event_participant_aggregate: Event_Event_Participant_Aggregate;
  /** fetch data from the table: "event.event_participant" using primary key columns */
  event_event_participant_by_pk?: Maybe<Event_Event_Participant>;
  /** fetch data from the table: "event.event_room" */
  event_event_room: Array<Event_Event_Room>;
  /** fetch aggregated fields from the table: "event.event_room" */
  event_event_room_aggregate: Event_Event_Room_Aggregate;
  /** fetch data from the table: "event.event_room" using primary key columns */
  event_event_room_by_pk?: Maybe<Event_Event_Room>;
  /** fetch data from the table: "event.event_target" */
  event_event_target: Array<Event_Event_Target>;
  /** fetch aggregated fields from the table: "event.event_target" */
  event_event_target_aggregate: Event_Event_Target_Aggregate;
  /** fetch data from the table: "event.event_target" using primary key columns */
  event_event_target_by_pk?: Maybe<Event_Event_Target>;
  /** fetch data from the table: "event.group_assignment" */
  event_group_assignment: Array<Event_Group_Assignment>;
  /** fetch aggregated fields from the table: "event.group_assignment" */
  event_group_assignment_aggregate: Event_Group_Assignment_Aggregate;
  /** fetch data from the table: "event.group_assignment" using primary key columns */
  event_group_assignment_by_pk?: Maybe<Event_Group_Assignment>;
  /** fetch data from the table: "event.routine" */
  event_routine: Array<Event_Routine>;
  /** fetch aggregated fields from the table: "event.routine" */
  event_routine_aggregate: Event_Routine_Aggregate;
  /** fetch data from the table: "event.routine" using primary key columns */
  event_routine_by_pk?: Maybe<Event_Routine>;
  /** fetch data from the table: "event.routine_exception" */
  event_routine_exception: Array<Event_Routine_Exception>;
  /** fetch aggregated fields from the table: "event.routine_exception" */
  event_routine_exception_aggregate: Event_Routine_Exception_Aggregate;
  /** fetch data from the table: "event.routine_exception" using primary key columns */
  event_routine_exception_by_pk?: Maybe<Event_Routine_Exception>;
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
  /** fetch data from the table: "user.device" */
  user_device: Array<User_Device>;
  /** fetch aggregated fields from the table: "user.device" */
  user_device_aggregate: User_Device_Aggregate;
  /** fetch data from the table: "user.device" using primary key columns */
  user_device_by_pk?: Maybe<User_Device>;
  /** fetch data from the table: "user.faculty" */
  user_faculty: Array<User_Faculty>;
  /** fetch aggregated fields from the table: "user.faculty" */
  user_faculty_aggregate: User_Faculty_Aggregate;
  /** fetch data from the table: "user.faculty" using primary key columns */
  user_faculty_by_pk?: Maybe<User_Faculty>;
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
  /** fetch data from the table: "user.profile" */
  user_profile: Array<User_Profile>;
  /** fetch aggregated fields from the table: "user.profile" */
  user_profile_aggregate: User_Profile_Aggregate;
  /** fetch data from the table: "user.profile" using primary key columns */
  user_profile_by_pk?: Maybe<User_Profile>;
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
  /** fetch data from the table: "venue.building" */
  venue_building: Array<Venue_Building>;
  /** fetch aggregated fields from the table: "venue.building" */
  venue_building_aggregate: Venue_Building_Aggregate;
  /** fetch data from the table: "venue.building" using primary key columns */
  venue_building_by_pk?: Maybe<Venue_Building>;
  /** fetch data from the table: "venue.room" */
  venue_room: Array<Venue_Room>;
  /** fetch aggregated fields from the table: "venue.room" */
  venue_room_aggregate: Venue_Room_Aggregate;
  /** fetch data from the table: "venue.room" using primary key columns */
  venue_room_by_pk?: Maybe<Venue_Room>;
};


export type Query_RootAcademic_BatchArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


export type Query_RootAcademic_Batch_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


export type Query_RootAcademic_Batch_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_Class_RepresentativeArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


export type Query_RootAcademic_Class_Representative_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


export type Query_RootAcademic_Class_Representative_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_CourseArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


export type Query_RootAcademic_Course_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


export type Query_RootAcademic_Course_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_Course_OfferingArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


export type Query_RootAcademic_Course_Offering_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


export type Query_RootAcademic_Course_Offering_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_DepartmentArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


export type Query_RootAcademic_Department_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


export type Query_RootAcademic_Department_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_FacultyArgs = {
  distinct_on?: InputMaybe<Array<Academic_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Faculty_Order_By>>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};


export type Query_RootAcademic_Faculty_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Faculty_Order_By>>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};


export type Query_RootAcademic_Faculty_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_SectionArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


export type Query_RootAcademic_Section_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


export type Query_RootAcademic_Section_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootAcademic_User_EnrollmentArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


export type Query_RootAcademic_User_Enrollment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


export type Query_RootAcademic_User_Enrollment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_EventArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


export type Query_RootEvent_Event_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


export type Query_RootEvent_Event_AttachmentArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attachment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attachment_Order_By>>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};


export type Query_RootEvent_Event_Attachment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attachment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attachment_Order_By>>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};


export type Query_RootEvent_Event_Attachment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_AttendanceArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attendance_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attendance_Order_By>>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};


export type Query_RootEvent_Event_Attendance_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attendance_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attendance_Order_By>>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};


export type Query_RootEvent_Event_Attendance_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_CancellationArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Cancellation_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Cancellation_Order_By>>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};


export type Query_RootEvent_Event_Cancellation_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Cancellation_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Cancellation_Order_By>>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};


export type Query_RootEvent_Event_Cancellation_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_ChangeArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Change_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Change_Order_By>>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};


export type Query_RootEvent_Event_Change_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Change_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Change_Order_By>>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};


export type Query_RootEvent_Event_Change_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_InstructorArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Instructor_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Instructor_Order_By>>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};


export type Query_RootEvent_Event_Instructor_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Instructor_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Instructor_Order_By>>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};


export type Query_RootEvent_Event_Instructor_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_ParticipantArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Participant_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Participant_Order_By>>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};


export type Query_RootEvent_Event_Participant_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Participant_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Participant_Order_By>>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};


export type Query_RootEvent_Event_Participant_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_RoomArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Room_Order_By>>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};


export type Query_RootEvent_Event_Room_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Room_Order_By>>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};


export type Query_RootEvent_Event_Room_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Event_TargetArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


export type Query_RootEvent_Event_Target_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


export type Query_RootEvent_Event_Target_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Group_AssignmentArgs = {
  distinct_on?: InputMaybe<Array<Event_Group_Assignment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Group_Assignment_Order_By>>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};


export type Query_RootEvent_Group_Assignment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Group_Assignment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Group_Assignment_Order_By>>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};


export type Query_RootEvent_Group_Assignment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_RoutineArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Order_By>>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
};


export type Query_RootEvent_Routine_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Order_By>>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
};


export type Query_RootEvent_Routine_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_Routine_ExceptionArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Exception_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Exception_Order_By>>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};


export type Query_RootEvent_Routine_Exception_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Exception_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Exception_Order_By>>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};


export type Query_RootEvent_Routine_Exception_By_PkArgs = {
  id: Scalars['uuid']['input'];
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


export type Query_RootUser_DeviceArgs = {
  distinct_on?: InputMaybe<Array<User_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Device_Order_By>>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};


export type Query_RootUser_Device_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Device_Order_By>>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};


export type Query_RootUser_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootUser_FacultyArgs = {
  distinct_on?: InputMaybe<Array<User_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Faculty_Order_By>>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
};


export type Query_RootUser_Faculty_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Faculty_Order_By>>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
};


export type Query_RootUser_Faculty_By_PkArgs = {
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


export type Query_RootUser_ProfileArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


export type Query_RootUser_Profile_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


export type Query_RootUser_Profile_By_PkArgs = {
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


export type Query_RootVenue_BuildingArgs = {
  distinct_on?: InputMaybe<Array<Venue_Building_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Building_Order_By>>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};


export type Query_RootVenue_Building_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Building_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Building_Order_By>>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};


export type Query_RootVenue_Building_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVenue_RoomArgs = {
  distinct_on?: InputMaybe<Array<Venue_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Room_Order_By>>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
};


export type Query_RootVenue_Room_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Room_Order_By>>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
};


export type Query_RootVenue_Room_By_PkArgs = {
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
  /** fetch data from the table: "academic.batch" */
  academic_batch: Array<Academic_Batch>;
  /** fetch aggregated fields from the table: "academic.batch" */
  academic_batch_aggregate: Academic_Batch_Aggregate;
  /** fetch data from the table: "academic.batch" using primary key columns */
  academic_batch_by_pk?: Maybe<Academic_Batch>;
  /** fetch data from the table in a streaming manner: "academic.batch" */
  academic_batch_stream: Array<Academic_Batch>;
  /** fetch data from the table: "academic.class_representative" */
  academic_class_representative: Array<Academic_Class_Representative>;
  /** fetch aggregated fields from the table: "academic.class_representative" */
  academic_class_representative_aggregate: Academic_Class_Representative_Aggregate;
  /** fetch data from the table: "academic.class_representative" using primary key columns */
  academic_class_representative_by_pk?: Maybe<Academic_Class_Representative>;
  /** fetch data from the table in a streaming manner: "academic.class_representative" */
  academic_class_representative_stream: Array<Academic_Class_Representative>;
  /** fetch data from the table: "academic.course" */
  academic_course: Array<Academic_Course>;
  /** fetch aggregated fields from the table: "academic.course" */
  academic_course_aggregate: Academic_Course_Aggregate;
  /** fetch data from the table: "academic.course" using primary key columns */
  academic_course_by_pk?: Maybe<Academic_Course>;
  /** fetch data from the table: "academic.course_offering" */
  academic_course_offering: Array<Academic_Course_Offering>;
  /** fetch aggregated fields from the table: "academic.course_offering" */
  academic_course_offering_aggregate: Academic_Course_Offering_Aggregate;
  /** fetch data from the table: "academic.course_offering" using primary key columns */
  academic_course_offering_by_pk?: Maybe<Academic_Course_Offering>;
  /** fetch data from the table in a streaming manner: "academic.course_offering" */
  academic_course_offering_stream: Array<Academic_Course_Offering>;
  /** fetch data from the table in a streaming manner: "academic.course" */
  academic_course_stream: Array<Academic_Course>;
  /** fetch data from the table: "academic.department" */
  academic_department: Array<Academic_Department>;
  /** fetch aggregated fields from the table: "academic.department" */
  academic_department_aggregate: Academic_Department_Aggregate;
  /** fetch data from the table: "academic.department" using primary key columns */
  academic_department_by_pk?: Maybe<Academic_Department>;
  /** fetch data from the table in a streaming manner: "academic.department" */
  academic_department_stream: Array<Academic_Department>;
  /** fetch data from the table: "academic.faculty" */
  academic_faculty: Array<Academic_Faculty>;
  /** fetch aggregated fields from the table: "academic.faculty" */
  academic_faculty_aggregate: Academic_Faculty_Aggregate;
  /** fetch data from the table: "academic.faculty" using primary key columns */
  academic_faculty_by_pk?: Maybe<Academic_Faculty>;
  /** fetch data from the table in a streaming manner: "academic.faculty" */
  academic_faculty_stream: Array<Academic_Faculty>;
  /** fetch data from the table: "academic.section" */
  academic_section: Array<Academic_Section>;
  /** fetch aggregated fields from the table: "academic.section" */
  academic_section_aggregate: Academic_Section_Aggregate;
  /** fetch data from the table: "academic.section" using primary key columns */
  academic_section_by_pk?: Maybe<Academic_Section>;
  /** fetch data from the table in a streaming manner: "academic.section" */
  academic_section_stream: Array<Academic_Section>;
  /** fetch data from the table: "academic.user_enrollment" */
  academic_user_enrollment: Array<Academic_User_Enrollment>;
  /** fetch aggregated fields from the table: "academic.user_enrollment" */
  academic_user_enrollment_aggregate: Academic_User_Enrollment_Aggregate;
  /** fetch data from the table: "academic.user_enrollment" using primary key columns */
  academic_user_enrollment_by_pk?: Maybe<Academic_User_Enrollment>;
  /** fetch data from the table in a streaming manner: "academic.user_enrollment" */
  academic_user_enrollment_stream: Array<Academic_User_Enrollment>;
  /** fetch data from the table: "event.event" */
  event_event: Array<Event_Event>;
  /** fetch aggregated fields from the table: "event.event" */
  event_event_aggregate: Event_Event_Aggregate;
  /** fetch data from the table: "event.event_attachment" */
  event_event_attachment: Array<Event_Event_Attachment>;
  /** fetch aggregated fields from the table: "event.event_attachment" */
  event_event_attachment_aggregate: Event_Event_Attachment_Aggregate;
  /** fetch data from the table: "event.event_attachment" using primary key columns */
  event_event_attachment_by_pk?: Maybe<Event_Event_Attachment>;
  /** fetch data from the table in a streaming manner: "event.event_attachment" */
  event_event_attachment_stream: Array<Event_Event_Attachment>;
  /** fetch data from the table: "event.event_attendance" */
  event_event_attendance: Array<Event_Event_Attendance>;
  /** fetch aggregated fields from the table: "event.event_attendance" */
  event_event_attendance_aggregate: Event_Event_Attendance_Aggregate;
  /** fetch data from the table: "event.event_attendance" using primary key columns */
  event_event_attendance_by_pk?: Maybe<Event_Event_Attendance>;
  /** fetch data from the table in a streaming manner: "event.event_attendance" */
  event_event_attendance_stream: Array<Event_Event_Attendance>;
  /** fetch data from the table: "event.event" using primary key columns */
  event_event_by_pk?: Maybe<Event_Event>;
  /** fetch data from the table: "event.event_cancellation" */
  event_event_cancellation: Array<Event_Event_Cancellation>;
  /** fetch aggregated fields from the table: "event.event_cancellation" */
  event_event_cancellation_aggregate: Event_Event_Cancellation_Aggregate;
  /** fetch data from the table: "event.event_cancellation" using primary key columns */
  event_event_cancellation_by_pk?: Maybe<Event_Event_Cancellation>;
  /** fetch data from the table in a streaming manner: "event.event_cancellation" */
  event_event_cancellation_stream: Array<Event_Event_Cancellation>;
  /** fetch data from the table: "event.event_change" */
  event_event_change: Array<Event_Event_Change>;
  /** fetch aggregated fields from the table: "event.event_change" */
  event_event_change_aggregate: Event_Event_Change_Aggregate;
  /** fetch data from the table: "event.event_change" using primary key columns */
  event_event_change_by_pk?: Maybe<Event_Event_Change>;
  /** fetch data from the table in a streaming manner: "event.event_change" */
  event_event_change_stream: Array<Event_Event_Change>;
  /** fetch data from the table: "event.event_instructor" */
  event_event_instructor: Array<Event_Event_Instructor>;
  /** fetch aggregated fields from the table: "event.event_instructor" */
  event_event_instructor_aggregate: Event_Event_Instructor_Aggregate;
  /** fetch data from the table: "event.event_instructor" using primary key columns */
  event_event_instructor_by_pk?: Maybe<Event_Event_Instructor>;
  /** fetch data from the table in a streaming manner: "event.event_instructor" */
  event_event_instructor_stream: Array<Event_Event_Instructor>;
  /** fetch data from the table: "event.event_participant" */
  event_event_participant: Array<Event_Event_Participant>;
  /** fetch aggregated fields from the table: "event.event_participant" */
  event_event_participant_aggregate: Event_Event_Participant_Aggregate;
  /** fetch data from the table: "event.event_participant" using primary key columns */
  event_event_participant_by_pk?: Maybe<Event_Event_Participant>;
  /** fetch data from the table in a streaming manner: "event.event_participant" */
  event_event_participant_stream: Array<Event_Event_Participant>;
  /** fetch data from the table: "event.event_room" */
  event_event_room: Array<Event_Event_Room>;
  /** fetch aggregated fields from the table: "event.event_room" */
  event_event_room_aggregate: Event_Event_Room_Aggregate;
  /** fetch data from the table: "event.event_room" using primary key columns */
  event_event_room_by_pk?: Maybe<Event_Event_Room>;
  /** fetch data from the table in a streaming manner: "event.event_room" */
  event_event_room_stream: Array<Event_Event_Room>;
  /** fetch data from the table in a streaming manner: "event.event" */
  event_event_stream: Array<Event_Event>;
  /** fetch data from the table: "event.event_target" */
  event_event_target: Array<Event_Event_Target>;
  /** fetch aggregated fields from the table: "event.event_target" */
  event_event_target_aggregate: Event_Event_Target_Aggregate;
  /** fetch data from the table: "event.event_target" using primary key columns */
  event_event_target_by_pk?: Maybe<Event_Event_Target>;
  /** fetch data from the table in a streaming manner: "event.event_target" */
  event_event_target_stream: Array<Event_Event_Target>;
  /** fetch data from the table: "event.group_assignment" */
  event_group_assignment: Array<Event_Group_Assignment>;
  /** fetch aggregated fields from the table: "event.group_assignment" */
  event_group_assignment_aggregate: Event_Group_Assignment_Aggregate;
  /** fetch data from the table: "event.group_assignment" using primary key columns */
  event_group_assignment_by_pk?: Maybe<Event_Group_Assignment>;
  /** fetch data from the table in a streaming manner: "event.group_assignment" */
  event_group_assignment_stream: Array<Event_Group_Assignment>;
  /** fetch data from the table: "event.routine" */
  event_routine: Array<Event_Routine>;
  /** fetch aggregated fields from the table: "event.routine" */
  event_routine_aggregate: Event_Routine_Aggregate;
  /** fetch data from the table: "event.routine" using primary key columns */
  event_routine_by_pk?: Maybe<Event_Routine>;
  /** fetch data from the table: "event.routine_exception" */
  event_routine_exception: Array<Event_Routine_Exception>;
  /** fetch aggregated fields from the table: "event.routine_exception" */
  event_routine_exception_aggregate: Event_Routine_Exception_Aggregate;
  /** fetch data from the table: "event.routine_exception" using primary key columns */
  event_routine_exception_by_pk?: Maybe<Event_Routine_Exception>;
  /** fetch data from the table in a streaming manner: "event.routine_exception" */
  event_routine_exception_stream: Array<Event_Routine_Exception>;
  /** fetch data from the table in a streaming manner: "event.routine" */
  event_routine_stream: Array<Event_Routine>;
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
  /** fetch data from the table: "user.device" */
  user_device: Array<User_Device>;
  /** fetch aggregated fields from the table: "user.device" */
  user_device_aggregate: User_Device_Aggregate;
  /** fetch data from the table: "user.device" using primary key columns */
  user_device_by_pk?: Maybe<User_Device>;
  /** fetch data from the table in a streaming manner: "user.device" */
  user_device_stream: Array<User_Device>;
  /** fetch data from the table: "user.faculty" */
  user_faculty: Array<User_Faculty>;
  /** fetch aggregated fields from the table: "user.faculty" */
  user_faculty_aggregate: User_Faculty_Aggregate;
  /** fetch data from the table: "user.faculty" using primary key columns */
  user_faculty_by_pk?: Maybe<User_Faculty>;
  /** fetch data from the table in a streaming manner: "user.faculty" */
  user_faculty_stream: Array<User_Faculty>;
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
  /** fetch data from the table: "user.profile" */
  user_profile: Array<User_Profile>;
  /** fetch aggregated fields from the table: "user.profile" */
  user_profile_aggregate: User_Profile_Aggregate;
  /** fetch data from the table: "user.profile" using primary key columns */
  user_profile_by_pk?: Maybe<User_Profile>;
  /** fetch data from the table in a streaming manner: "user.profile" */
  user_profile_stream: Array<User_Profile>;
  /** fetch data from the table: "user.session" */
  user_session: Array<User_Session>;
  /** fetch aggregated fields from the table: "user.session" */
  user_session_aggregate: User_Session_Aggregate;
  /** fetch data from the table: "user.session" using primary key columns */
  user_session_by_pk?: Maybe<User_Session>;
  /** fetch data from the table in a streaming manner: "user.session" */
  user_session_stream: Array<User_Session>;
  /** fetch data from the table: "venue.building" */
  venue_building: Array<Venue_Building>;
  /** fetch aggregated fields from the table: "venue.building" */
  venue_building_aggregate: Venue_Building_Aggregate;
  /** fetch data from the table: "venue.building" using primary key columns */
  venue_building_by_pk?: Maybe<Venue_Building>;
  /** fetch data from the table in a streaming manner: "venue.building" */
  venue_building_stream: Array<Venue_Building>;
  /** fetch data from the table: "venue.room" */
  venue_room: Array<Venue_Room>;
  /** fetch aggregated fields from the table: "venue.room" */
  venue_room_aggregate: Venue_Room_Aggregate;
  /** fetch data from the table: "venue.room" using primary key columns */
  venue_room_by_pk?: Maybe<Venue_Room>;
  /** fetch data from the table in a streaming manner: "venue.room" */
  venue_room_stream: Array<Venue_Room>;
};


export type Subscription_RootAcademic_BatchArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


export type Subscription_RootAcademic_Batch_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Batch_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Batch_Order_By>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


export type Subscription_RootAcademic_Batch_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Batch_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Batch_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Batch_Bool_Exp>;
};


export type Subscription_RootAcademic_Class_RepresentativeArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


export type Subscription_RootAcademic_Class_Representative_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


export type Subscription_RootAcademic_Class_Representative_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Class_Representative_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Class_Representative_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


export type Subscription_RootAcademic_CourseArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


export type Subscription_RootAcademic_Course_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Order_By>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


export type Subscription_RootAcademic_Course_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Course_OfferingArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


export type Subscription_RootAcademic_Course_Offering_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Course_Offering_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Course_Offering_Order_By>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


export type Subscription_RootAcademic_Course_Offering_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Course_Offering_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Course_Offering_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Course_Offering_Bool_Exp>;
};


export type Subscription_RootAcademic_Course_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Course_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Course_Bool_Exp>;
};


export type Subscription_RootAcademic_DepartmentArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


export type Subscription_RootAcademic_Department_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


export type Subscription_RootAcademic_Department_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Department_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Department_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


export type Subscription_RootAcademic_FacultyArgs = {
  distinct_on?: InputMaybe<Array<Academic_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Faculty_Order_By>>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};


export type Subscription_RootAcademic_Faculty_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Faculty_Order_By>>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};


export type Subscription_RootAcademic_Faculty_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Faculty_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Faculty_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Faculty_Bool_Exp>;
};


export type Subscription_RootAcademic_SectionArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


export type Subscription_RootAcademic_Section_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Section_Order_By>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


export type Subscription_RootAcademic_Section_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_Section_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_Section_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_Section_Bool_Exp>;
};


export type Subscription_RootAcademic_User_EnrollmentArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


export type Subscription_RootAcademic_User_Enrollment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


export type Subscription_RootAcademic_User_Enrollment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAcademic_User_Enrollment_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Academic_User_Enrollment_Stream_Cursor_Input>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


export type Subscription_RootEvent_EventArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


export type Subscription_RootEvent_Event_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Order_By>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


export type Subscription_RootEvent_Event_AttachmentArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attachment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attachment_Order_By>>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Attachment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attachment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attachment_Order_By>>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Attachment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Attachment_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Attachment_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Attachment_Bool_Exp>;
};


export type Subscription_RootEvent_Event_AttendanceArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attendance_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attendance_Order_By>>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Attendance_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Attendance_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Attendance_Order_By>>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Attendance_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Attendance_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Attendance_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Attendance_Bool_Exp>;
};


export type Subscription_RootEvent_Event_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_CancellationArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Cancellation_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Cancellation_Order_By>>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Cancellation_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Cancellation_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Cancellation_Order_By>>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Cancellation_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Cancellation_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Cancellation_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Cancellation_Bool_Exp>;
};


export type Subscription_RootEvent_Event_ChangeArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Change_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Change_Order_By>>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Change_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Change_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Change_Order_By>>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Change_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Change_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Change_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Change_Bool_Exp>;
};


export type Subscription_RootEvent_Event_InstructorArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Instructor_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Instructor_Order_By>>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Instructor_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Instructor_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Instructor_Order_By>>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Instructor_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Instructor_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Instructor_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Instructor_Bool_Exp>;
};


export type Subscription_RootEvent_Event_ParticipantArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Participant_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Participant_Order_By>>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Participant_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Participant_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Participant_Order_By>>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Participant_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Participant_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Participant_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Participant_Bool_Exp>;
};


export type Subscription_RootEvent_Event_RoomArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Room_Order_By>>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Room_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Room_Order_By>>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Room_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Room_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Room_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Room_Bool_Exp>;
};


export type Subscription_RootEvent_Event_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Bool_Exp>;
};


export type Subscription_RootEvent_Event_TargetArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Target_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Event_Target_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Event_Target_Order_By>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


export type Subscription_RootEvent_Event_Target_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Event_Target_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Event_Target_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Event_Target_Bool_Exp>;
};


export type Subscription_RootEvent_Group_AssignmentArgs = {
  distinct_on?: InputMaybe<Array<Event_Group_Assignment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Group_Assignment_Order_By>>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};


export type Subscription_RootEvent_Group_Assignment_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Group_Assignment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Group_Assignment_Order_By>>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};


export type Subscription_RootEvent_Group_Assignment_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Group_Assignment_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Group_Assignment_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Group_Assignment_Bool_Exp>;
};


export type Subscription_RootEvent_RoutineArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Order_By>>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
};


export type Subscription_RootEvent_Routine_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Order_By>>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
};


export type Subscription_RootEvent_Routine_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Routine_ExceptionArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Exception_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Exception_Order_By>>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};


export type Subscription_RootEvent_Routine_Exception_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Routine_Exception_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Routine_Exception_Order_By>>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};


export type Subscription_RootEvent_Routine_Exception_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Routine_Exception_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Routine_Exception_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Routine_Exception_Bool_Exp>;
};


export type Subscription_RootEvent_Routine_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Routine_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Routine_Bool_Exp>;
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


export type Subscription_RootUser_DeviceArgs = {
  distinct_on?: InputMaybe<Array<User_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Device_Order_By>>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};


export type Subscription_RootUser_Device_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Device_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Device_Order_By>>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};


export type Subscription_RootUser_Device_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Device_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Device_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};


export type Subscription_RootUser_FacultyArgs = {
  distinct_on?: InputMaybe<Array<User_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Faculty_Order_By>>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
};


export type Subscription_RootUser_Faculty_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Faculty_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Faculty_Order_By>>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
};


export type Subscription_RootUser_Faculty_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Faculty_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Faculty_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
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


export type Subscription_RootUser_ProfileArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


export type Subscription_RootUser_Profile_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


export type Subscription_RootUser_Profile_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUser_Profile_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Profile_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
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


export type Subscription_RootVenue_BuildingArgs = {
  distinct_on?: InputMaybe<Array<Venue_Building_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Building_Order_By>>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};


export type Subscription_RootVenue_Building_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Building_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Building_Order_By>>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};


export type Subscription_RootVenue_Building_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Building_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Building_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};


export type Subscription_RootVenue_RoomArgs = {
  distinct_on?: InputMaybe<Array<Venue_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Room_Order_By>>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
};


export type Subscription_RootVenue_Room_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Room_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Room_Order_By>>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
};


export type Subscription_RootVenue_Room_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Room_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Room_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
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

/** Boolean expression to compare columns of type "timetz". All fields are combined with logical 'AND'. */
export type Timetz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timetz']['input']>;
  _gt?: InputMaybe<Scalars['timetz']['input']>;
  _gte?: InputMaybe<Scalars['timetz']['input']>;
  _in?: InputMaybe<Array<Scalars['timetz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timetz']['input']>;
  _lte?: InputMaybe<Scalars['timetz']['input']>;
  _neq?: InputMaybe<Scalars['timetz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timetz']['input']>>;
};

/** columns and relationships of "user.account" */
export type User_Account = {
  __typename?: 'user_account';
  /** An array relationship */
  class_representatives: Array<Academic_Class_Representative>;
  /** An aggregate relationship */
  class_representatives_aggregate: Academic_Class_Representative_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  departments: Array<Academic_Department>;
  /** An aggregate relationship */
  departments_aggregate: Academic_Department_Aggregate;
  email?: Maybe<Scalars['String']['output']>;
  email_verified_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  faculties?: Maybe<User_Faculty>;
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  password: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  phone_verified_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  profiles: Array<User_Profile>;
  /** An aggregate relationship */
  profiles_aggregate: User_Profile_Aggregate;
  role: Scalars['String']['output'];
  /** An array relationship */
  sessions: Array<User_Session>;
  /** An aggregate relationship */
  sessions_aggregate: User_Session_Aggregate;
  updated_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  user_enrollments: Array<Academic_User_Enrollment>;
  /** An aggregate relationship */
  user_enrollments_aggregate: Academic_User_Enrollment_Aggregate;
};


/** columns and relationships of "user.account" */
export type User_AccountClass_RepresentativesArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountClass_Representatives_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Class_Representative_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Class_Representative_Order_By>>;
  where?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountDepartmentsArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountDepartments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_Department_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_Department_Order_By>>;
  where?: InputMaybe<Academic_Department_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountProfilesArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountProfiles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Profile_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Profile_Order_By>>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountSessionsArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Session_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Session_Order_By>>;
  where?: InputMaybe<User_Session_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountUser_EnrollmentsArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
};


/** columns and relationships of "user.account" */
export type User_AccountUser_Enrollments_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Academic_User_Enrollment_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Academic_User_Enrollment_Order_By>>;
  where?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
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
  class_representatives?: InputMaybe<Academic_Class_Representative_Bool_Exp>;
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  departments?: InputMaybe<Academic_Department_Bool_Exp>;
  departments_aggregate?: InputMaybe<Academic_Department_Aggregate_Bool_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  email_verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  faculties?: InputMaybe<User_Faculty_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  password?: InputMaybe<String_Comparison_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  phone_verified_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  profiles?: InputMaybe<User_Profile_Bool_Exp>;
  profiles_aggregate?: InputMaybe<User_Profile_Aggregate_Bool_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  sessions?: InputMaybe<User_Session_Bool_Exp>;
  sessions_aggregate?: InputMaybe<User_Session_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_enrollments?: InputMaybe<Academic_User_Enrollment_Bool_Exp>;
  user_enrollments_aggregate?: InputMaybe<Academic_User_Enrollment_Aggregate_Bool_Exp>;
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
  class_representatives?: InputMaybe<Academic_Class_Representative_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  departments?: InputMaybe<Academic_Department_Arr_Rel_Insert_Input>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  faculties?: InputMaybe<User_Faculty_Obj_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  phone_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
  profiles?: InputMaybe<User_Profile_Arr_Rel_Insert_Input>;
  role?: InputMaybe<Scalars['String']['input']>;
  sessions?: InputMaybe<User_Session_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_enrollments?: InputMaybe<Academic_User_Enrollment_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type User_Account_Max_Fields = {
  __typename?: 'user_account_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  email_verified_at?: Maybe<Scalars['timestamptz']['output']>;
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
  email_verified_at?: Maybe<Scalars['timestamptz']['output']>;
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

/** input type for inserting object relation for remote table "user.account" */
export type User_Account_Obj_Rel_Insert_Input = {
  data: User_Account_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Account_On_Conflict>;
};

/** on_conflict condition type for table "user.account" */
export type User_Account_On_Conflict = {
  constraint: User_Account_Constraint;
  update_columns?: Array<User_Account_Update_Column>;
  where?: InputMaybe<User_Account_Bool_Exp>;
};

/** Ordering options when selecting data from "user.account". */
export type User_Account_Order_By = {
  class_representatives_aggregate?: InputMaybe<Academic_Class_Representative_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  departments_aggregate?: InputMaybe<Academic_Department_Aggregate_Order_By>;
  email?: InputMaybe<Order_By>;
  email_verified_at?: InputMaybe<Order_By>;
  faculties?: InputMaybe<User_Faculty_Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  password?: InputMaybe<Order_By>;
  phone?: InputMaybe<Order_By>;
  phone_verified_at?: InputMaybe<Order_By>;
  profiles_aggregate?: InputMaybe<User_Profile_Aggregate_Order_By>;
  role?: InputMaybe<Order_By>;
  sessions_aggregate?: InputMaybe<User_Session_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_enrollments_aggregate?: InputMaybe<Academic_User_Enrollment_Aggregate_Order_By>;
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
  EmailVerifiedAt = 'email_verified_at',
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
  email_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
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
  email_verified_at?: InputMaybe<Scalars['timestamptz']['input']>;
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
  EmailVerifiedAt = 'email_verified_at',
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

/** columns and relationships of "user.device" */
export type User_Device = {
  __typename?: 'user_device';
  created_at: Scalars['timestamptz']['output'];
  device_id: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active: Scalars['Boolean']['output'];
  last_used_at: Scalars['timestamptz']['output'];
  platform: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  token: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "user.device" */
export type User_Device_Aggregate = {
  __typename?: 'user_device_aggregate';
  aggregate?: Maybe<User_Device_Aggregate_Fields>;
  nodes: Array<User_Device>;
};

/** aggregate fields of "user.device" */
export type User_Device_Aggregate_Fields = {
  __typename?: 'user_device_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Device_Max_Fields>;
  min?: Maybe<User_Device_Min_Fields>;
};


/** aggregate fields of "user.device" */
export type User_Device_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Device_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "user.device". All fields are combined with a logical 'AND'. */
export type User_Device_Bool_Exp = {
  _and?: InputMaybe<Array<User_Device_Bool_Exp>>;
  _not?: InputMaybe<User_Device_Bool_Exp>;
  _or?: InputMaybe<Array<User_Device_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  device_id?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  last_used_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  platform?: InputMaybe<String_Comparison_Exp>;
  provider?: InputMaybe<String_Comparison_Exp>;
  token?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.device" */
export enum User_Device_Constraint {
  /** unique or primary key constraint on columns "id" */
  DevicePkey = 'device_pkey',
  /** unique or primary key constraint on columns "user_id", "provider", "device_id" */
  DeviceUserIdDeviceIdProviderKey = 'device_user_id_device_id_provider_key'
}

/** input type for inserting data into table "user.device" */
export type User_Device_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type User_Device_Max_Fields = {
  __typename?: 'user_device_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  device_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_used_at?: Maybe<Scalars['timestamptz']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type User_Device_Min_Fields = {
  __typename?: 'user_device_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  device_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_used_at?: Maybe<Scalars['timestamptz']['output']>;
  platform?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "user.device" */
export type User_Device_Mutation_Response = {
  __typename?: 'user_device_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Device>;
};

/** on_conflict condition type for table "user.device" */
export type User_Device_On_Conflict = {
  constraint: User_Device_Constraint;
  update_columns?: Array<User_Device_Update_Column>;
  where?: InputMaybe<User_Device_Bool_Exp>;
};

/** Ordering options when selecting data from "user.device". */
export type User_Device_Order_By = {
  created_at?: InputMaybe<Order_By>;
  device_id?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  last_used_at?: InputMaybe<Order_By>;
  platform?: InputMaybe<Order_By>;
  provider?: InputMaybe<Order_By>;
  token?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.device */
export type User_Device_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user.device" */
export enum User_Device_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeviceId = 'device_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastUsedAt = 'last_used_at',
  /** column name */
  Platform = 'platform',
  /** column name */
  Provider = 'provider',
  /** column name */
  Token = 'token',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "user.device" */
export type User_Device_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "user_device" */
export type User_Device_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Device_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Device_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  device_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_used_at?: InputMaybe<Scalars['timestamptz']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "user.device" */
export enum User_Device_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeviceId = 'device_id',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastUsedAt = 'last_used_at',
  /** column name */
  Platform = 'platform',
  /** column name */
  Provider = 'provider',
  /** column name */
  Token = 'token',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type User_Device_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Device_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Device_Bool_Exp;
};

/** columns and relationships of "user.faculty" */
export type User_Faculty = {
  __typename?: 'user_faculty';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  department?: Maybe<Academic_Department>;
  department_id: Scalars['uuid']['output'];
  description?: Maybe<Scalars['jsonb']['output']>;
  designation: Scalars['String']['output'];
  /** An object relationship */
  faculty?: Maybe<Academic_Faculty>;
  faculty_id: Scalars['uuid']['output'];
  first_name?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  user?: Maybe<User_Account>;
  user_id: Scalars['uuid']['output'];
};


/** columns and relationships of "user.faculty" */
export type User_FacultyDescriptionArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "user.faculty" */
export type User_Faculty_Aggregate = {
  __typename?: 'user_faculty_aggregate';
  aggregate?: Maybe<User_Faculty_Aggregate_Fields>;
  nodes: Array<User_Faculty>;
};

/** aggregate fields of "user.faculty" */
export type User_Faculty_Aggregate_Fields = {
  __typename?: 'user_faculty_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Faculty_Max_Fields>;
  min?: Maybe<User_Faculty_Min_Fields>;
};


/** aggregate fields of "user.faculty" */
export type User_Faculty_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Faculty_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type User_Faculty_Append_Input = {
  description?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "user.faculty". All fields are combined with a logical 'AND'. */
export type User_Faculty_Bool_Exp = {
  _and?: InputMaybe<Array<User_Faculty_Bool_Exp>>;
  _not?: InputMaybe<User_Faculty_Bool_Exp>;
  _or?: InputMaybe<Array<User_Faculty_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  department?: InputMaybe<Academic_Department_Bool_Exp>;
  department_id?: InputMaybe<Uuid_Comparison_Exp>;
  description?: InputMaybe<Jsonb_Comparison_Exp>;
  designation?: InputMaybe<String_Comparison_Exp>;
  faculty?: InputMaybe<Academic_Faculty_Bool_Exp>;
  faculty_id?: InputMaybe<Uuid_Comparison_Exp>;
  first_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<User_Account_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.faculty" */
export enum User_Faculty_Constraint {
  /** unique or primary key constraint on columns "id" */
  FacultyPkey = 'faculty_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type User_Faculty_Delete_At_Path_Input = {
  description?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type User_Faculty_Delete_Elem_Input = {
  description?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type User_Faculty_Delete_Key_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "user.faculty" */
export type User_Faculty_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  department?: InputMaybe<Academic_Department_Obj_Rel_Insert_Input>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['jsonb']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  faculty?: InputMaybe<Academic_Faculty_Obj_Rel_Insert_Input>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type User_Faculty_Max_Fields = {
  __typename?: 'user_faculty_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  designation?: Maybe<Scalars['String']['output']>;
  faculty_id?: Maybe<Scalars['uuid']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type User_Faculty_Min_Fields = {
  __typename?: 'user_faculty_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  designation?: Maybe<Scalars['String']['output']>;
  faculty_id?: Maybe<Scalars['uuid']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "user.faculty" */
export type User_Faculty_Mutation_Response = {
  __typename?: 'user_faculty_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Faculty>;
};

/** input type for inserting object relation for remote table "user.faculty" */
export type User_Faculty_Obj_Rel_Insert_Input = {
  data: User_Faculty_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Faculty_On_Conflict>;
};

/** on_conflict condition type for table "user.faculty" */
export type User_Faculty_On_Conflict = {
  constraint: User_Faculty_Constraint;
  update_columns?: Array<User_Faculty_Update_Column>;
  where?: InputMaybe<User_Faculty_Bool_Exp>;
};

/** Ordering options when selecting data from "user.faculty". */
export type User_Faculty_Order_By = {
  created_at?: InputMaybe<Order_By>;
  department?: InputMaybe<Academic_Department_Order_By>;
  department_id?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  designation?: InputMaybe<Order_By>;
  faculty?: InputMaybe<Academic_Faculty_Order_By>;
  faculty_id?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Account_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.faculty */
export type User_Faculty_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type User_Faculty_Prepend_Input = {
  description?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "user.faculty" */
export enum User_Faculty_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  Description = 'description',
  /** column name */
  Designation = 'designation',
  /** column name */
  FacultyId = 'faculty_id',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "user.faculty" */
export type User_Faculty_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['jsonb']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "user_faculty" */
export type User_Faculty_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Faculty_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Faculty_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  description?: InputMaybe<Scalars['jsonb']['input']>;
  designation?: InputMaybe<Scalars['String']['input']>;
  faculty_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "user.faculty" */
export enum User_Faculty_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  Description = 'description',
  /** column name */
  Designation = 'designation',
  /** column name */
  FacultyId = 'faculty_id',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type User_Faculty_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<User_Faculty_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<User_Faculty_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<User_Faculty_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<User_Faculty_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<User_Faculty_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Faculty_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Faculty_Bool_Exp;
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

/** columns and relationships of "user.profile" */
export type User_Profile = {
  __typename?: 'user_profile';
  address?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  batch?: Maybe<Academic_Batch>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  blood_group?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  date_of_birth?: Maybe<Scalars['date']['output']>;
  /** An object relationship */
  department?: Maybe<Academic_Department>;
  department_id: Scalars['uuid']['output'];
  first_name: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  last_name: Scalars['String']['output'];
  /** An object relationship */
  section?: Maybe<Academic_Section>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  student_id?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: User_Account;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "user.profile" */
export type User_Profile_Aggregate = {
  __typename?: 'user_profile_aggregate';
  aggregate?: Maybe<User_Profile_Aggregate_Fields>;
  nodes: Array<User_Profile>;
};

export type User_Profile_Aggregate_Bool_Exp = {
  count?: InputMaybe<User_Profile_Aggregate_Bool_Exp_Count>;
};

export type User_Profile_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Profile_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Profile_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user.profile" */
export type User_Profile_Aggregate_Fields = {
  __typename?: 'user_profile_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Profile_Max_Fields>;
  min?: Maybe<User_Profile_Min_Fields>;
};


/** aggregate fields of "user.profile" */
export type User_Profile_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Profile_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user.profile" */
export type User_Profile_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Profile_Max_Order_By>;
  min?: InputMaybe<User_Profile_Min_Order_By>;
};

/** input type for inserting array relation for remote table "user.profile" */
export type User_Profile_Arr_Rel_Insert_Input = {
  data: Array<User_Profile_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Profile_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user.profile". All fields are combined with a logical 'AND'. */
export type User_Profile_Bool_Exp = {
  _and?: InputMaybe<Array<User_Profile_Bool_Exp>>;
  _not?: InputMaybe<User_Profile_Bool_Exp>;
  _or?: InputMaybe<Array<User_Profile_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  avatar?: InputMaybe<String_Comparison_Exp>;
  batch?: InputMaybe<Academic_Batch_Bool_Exp>;
  batch_id?: InputMaybe<Uuid_Comparison_Exp>;
  blood_group?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  date_of_birth?: InputMaybe<Date_Comparison_Exp>;
  department?: InputMaybe<Academic_Department_Bool_Exp>;
  department_id?: InputMaybe<Uuid_Comparison_Exp>;
  first_name?: InputMaybe<String_Comparison_Exp>;
  gender?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_name?: InputMaybe<String_Comparison_Exp>;
  section?: InputMaybe<Academic_Section_Bool_Exp>;
  section_id?: InputMaybe<Uuid_Comparison_Exp>;
  student_id?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<User_Account_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user.profile" */
export enum User_Profile_Constraint {
  /** unique or primary key constraint on columns "id" */
  ProfilePkey = 'profile_pkey',
  /** unique or primary key constraint on columns "student_id" */
  ProfileStudentIdKey = 'profile_student_id_key'
}

/** input type for inserting data into table "user.profile" */
export type User_Profile_Insert_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  batch?: InputMaybe<Academic_Batch_Obj_Rel_Insert_Input>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  blood_group?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth?: InputMaybe<Scalars['date']['input']>;
  department?: InputMaybe<Academic_Department_Obj_Rel_Insert_Input>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  section?: InputMaybe<Academic_Section_Obj_Rel_Insert_Input>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  student_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type User_Profile_Max_Fields = {
  __typename?: 'user_profile_max_fields';
  address?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  blood_group?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  date_of_birth?: Maybe<Scalars['date']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  student_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "user.profile" */
export type User_Profile_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  avatar?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  blood_group?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth?: InputMaybe<Order_By>;
  department_id?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  student_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Profile_Min_Fields = {
  __typename?: 'user_profile_min_fields';
  address?: Maybe<Scalars['String']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  batch_id?: Maybe<Scalars['uuid']['output']>;
  blood_group?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  date_of_birth?: Maybe<Scalars['date']['output']>;
  department_id?: Maybe<Scalars['uuid']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['uuid']['output']>;
  student_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "user.profile" */
export type User_Profile_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  avatar?: InputMaybe<Order_By>;
  batch_id?: InputMaybe<Order_By>;
  blood_group?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth?: InputMaybe<Order_By>;
  department_id?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  student_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user.profile" */
export type User_Profile_Mutation_Response = {
  __typename?: 'user_profile_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Profile>;
};

/** on_conflict condition type for table "user.profile" */
export type User_Profile_On_Conflict = {
  constraint: User_Profile_Constraint;
  update_columns?: Array<User_Profile_Update_Column>;
  where?: InputMaybe<User_Profile_Bool_Exp>;
};

/** Ordering options when selecting data from "user.profile". */
export type User_Profile_Order_By = {
  address?: InputMaybe<Order_By>;
  avatar?: InputMaybe<Order_By>;
  batch?: InputMaybe<Academic_Batch_Order_By>;
  batch_id?: InputMaybe<Order_By>;
  blood_group?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth?: InputMaybe<Order_By>;
  department?: InputMaybe<Academic_Department_Order_By>;
  department_id?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  section?: InputMaybe<Academic_Section_Order_By>;
  section_id?: InputMaybe<Order_By>;
  student_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Account_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user.profile */
export type User_Profile_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user.profile" */
export enum User_Profile_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Avatar = 'avatar',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  BloodGroup = 'blood_group',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DateOfBirth = 'date_of_birth',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Gender = 'gender',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  StudentId = 'student_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "user.profile" */
export type User_Profile_Set_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  blood_group?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth?: InputMaybe<Scalars['date']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  student_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "user_profile" */
export type User_Profile_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Profile_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Profile_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  batch_id?: InputMaybe<Scalars['uuid']['input']>;
  blood_group?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth?: InputMaybe<Scalars['date']['input']>;
  department_id?: InputMaybe<Scalars['uuid']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['uuid']['input']>;
  student_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "user.profile" */
export enum User_Profile_Update_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Avatar = 'avatar',
  /** column name */
  BatchId = 'batch_id',
  /** column name */
  BloodGroup = 'blood_group',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DateOfBirth = 'date_of_birth',
  /** column name */
  DepartmentId = 'department_id',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Gender = 'gender',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  StudentId = 'student_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type User_Profile_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Profile_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Profile_Bool_Exp;
};

/** This will store user sessions  */
export type User_Session = {
  __typename?: 'user_session';
  access_token: Scalars['String']['output'];
  access_token_expires_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  account?: Maybe<User_Account>;
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

export type User_Session_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<User_Session_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<User_Session_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<User_Session_Aggregate_Bool_Exp_Count>;
};

export type User_Session_Aggregate_Bool_Exp_Bool_And = {
  arguments: User_Session_Select_Column_User_Session_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Session_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Session_Aggregate_Bool_Exp_Bool_Or = {
  arguments: User_Session_Select_Column_User_Session_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Session_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Session_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Session_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Session_Bool_Exp>;
  predicate: Int_Comparison_Exp;
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

/** order by aggregate values of table "user.session" */
export type User_Session_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Session_Max_Order_By>;
  min?: InputMaybe<User_Session_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type User_Session_Append_Input = {
  device_info?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "user.session" */
export type User_Session_Arr_Rel_Insert_Input = {
  data: Array<User_Session_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Session_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user.session". All fields are combined with a logical 'AND'. */
export type User_Session_Bool_Exp = {
  _and?: InputMaybe<Array<User_Session_Bool_Exp>>;
  _not?: InputMaybe<User_Session_Bool_Exp>;
  _or?: InputMaybe<Array<User_Session_Bool_Exp>>;
  access_token?: InputMaybe<String_Comparison_Exp>;
  access_token_expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  account?: InputMaybe<User_Account_Bool_Exp>;
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
  account?: InputMaybe<User_Account_Obj_Rel_Insert_Input>;
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

/** order by max() on columns of table "user.session" */
export type User_Session_Max_Order_By = {
  access_token?: InputMaybe<Order_By>;
  access_token_expires_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  last_used_at?: InputMaybe<Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  refresh_token_expires_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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

/** order by min() on columns of table "user.session" */
export type User_Session_Min_Order_By = {
  access_token?: InputMaybe<Order_By>;
  access_token_expires_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  last_used_at?: InputMaybe<Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  refresh_token_expires_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  account?: InputMaybe<User_Account_Order_By>;
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

/** select "user_session_aggregate_bool_exp_bool_and_arguments_columns" columns of table "user.session" */
export enum User_Session_Select_Column_User_Session_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Revoked = 'revoked'
}

/** select "user_session_aggregate_bool_exp_bool_or_arguments_columns" columns of table "user.session" */
export enum User_Session_Select_Column_User_Session_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Revoked = 'revoked'
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

/** columns and relationships of "venue.building" */
export type Venue_Building = {
  __typename?: 'venue_building';
  address: Scalars['String']['output'];
  code: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "venue.building" */
export type Venue_Building_Aggregate = {
  __typename?: 'venue_building_aggregate';
  aggregate?: Maybe<Venue_Building_Aggregate_Fields>;
  nodes: Array<Venue_Building>;
};

/** aggregate fields of "venue.building" */
export type Venue_Building_Aggregate_Fields = {
  __typename?: 'venue_building_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Building_Max_Fields>;
  min?: Maybe<Venue_Building_Min_Fields>;
};


/** aggregate fields of "venue.building" */
export type Venue_Building_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Building_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "venue.building". All fields are combined with a logical 'AND'. */
export type Venue_Building_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Building_Bool_Exp>>;
  _not?: InputMaybe<Venue_Building_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Building_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  latitude?: InputMaybe<String_Comparison_Exp>;
  longitude?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue.building" */
export enum Venue_Building_Constraint {
  /** unique or primary key constraint on columns "code" */
  BuildingCodeKey = 'building_code_key',
  /** unique or primary key constraint on columns "id" */
  BuildingPkey = 'building_pkey'
}

/** input type for inserting data into table "venue.building" */
export type Venue_Building_Insert_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Venue_Building_Max_Fields = {
  __typename?: 'venue_building_max_fields';
  address?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Venue_Building_Min_Fields = {
  __typename?: 'venue_building_min_fields';
  address?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  latitude?: Maybe<Scalars['String']['output']>;
  longitude?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "venue.building" */
export type Venue_Building_Mutation_Response = {
  __typename?: 'venue_building_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Building>;
};

/** on_conflict condition type for table "venue.building" */
export type Venue_Building_On_Conflict = {
  constraint: Venue_Building_Constraint;
  update_columns?: Array<Venue_Building_Update_Column>;
  where?: InputMaybe<Venue_Building_Bool_Exp>;
};

/** Ordering options when selecting data from "venue.building". */
export type Venue_Building_Order_By = {
  address?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  latitude?: InputMaybe<Order_By>;
  longitude?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue.building */
export type Venue_Building_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "venue.building" */
export enum Venue_Building_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Latitude = 'latitude',
  /** column name */
  Longitude = 'longitude',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "venue.building" */
export type Venue_Building_Set_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "venue_building" */
export type Venue_Building_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Building_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Building_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  latitude?: InputMaybe<Scalars['String']['input']>;
  longitude?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "venue.building" */
export enum Venue_Building_Update_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Code = 'code',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Latitude = 'latitude',
  /** column name */
  Longitude = 'longitude',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Venue_Building_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Building_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Building_Bool_Exp;
};

/** columns and relationships of "venue.room" */
export type Venue_Room = {
  __typename?: 'venue_room';
  building_id: Scalars['uuid']['output'];
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  facility?: Maybe<Scalars['jsonb']['output']>;
  floor: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  room_name: Scalars['String']['output'];
  room_number: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "venue.room" */
export type Venue_RoomFacilityArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "venue.room" */
export type Venue_Room_Aggregate = {
  __typename?: 'venue_room_aggregate';
  aggregate?: Maybe<Venue_Room_Aggregate_Fields>;
  nodes: Array<Venue_Room>;
};

/** aggregate fields of "venue.room" */
export type Venue_Room_Aggregate_Fields = {
  __typename?: 'venue_room_aggregate_fields';
  avg?: Maybe<Venue_Room_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Room_Max_Fields>;
  min?: Maybe<Venue_Room_Min_Fields>;
  stddev?: Maybe<Venue_Room_Stddev_Fields>;
  stddev_pop?: Maybe<Venue_Room_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Venue_Room_Stddev_Samp_Fields>;
  sum?: Maybe<Venue_Room_Sum_Fields>;
  var_pop?: Maybe<Venue_Room_Var_Pop_Fields>;
  var_samp?: Maybe<Venue_Room_Var_Samp_Fields>;
  variance?: Maybe<Venue_Room_Variance_Fields>;
};


/** aggregate fields of "venue.room" */
export type Venue_Room_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Room_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Venue_Room_Append_Input = {
  facility?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate avg on columns */
export type Venue_Room_Avg_Fields = {
  __typename?: 'venue_room_avg_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "venue.room". All fields are combined with a logical 'AND'. */
export type Venue_Room_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Room_Bool_Exp>>;
  _not?: InputMaybe<Venue_Room_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Room_Bool_Exp>>;
  building_id?: InputMaybe<Uuid_Comparison_Exp>;
  capacity?: InputMaybe<Int_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  facility?: InputMaybe<Jsonb_Comparison_Exp>;
  floor?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  room_name?: InputMaybe<String_Comparison_Exp>;
  room_number?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue.room" */
export enum Venue_Room_Constraint {
  /** unique or primary key constraint on columns "building_id", "room_number" */
  RoomBuildingIdRoomNumberKey = 'room_building_id_room_number_key',
  /** unique or primary key constraint on columns "id" */
  RoomPkey = 'room_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Venue_Room_Delete_At_Path_Input = {
  facility?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Venue_Room_Delete_Elem_Input = {
  facility?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Venue_Room_Delete_Key_Input = {
  facility?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "venue.room" */
export type Venue_Room_Inc_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "venue.room" */
export type Venue_Room_Insert_Input = {
  building_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  facility?: InputMaybe<Scalars['jsonb']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  room_name?: InputMaybe<Scalars['String']['input']>;
  room_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Venue_Room_Max_Fields = {
  __typename?: 'venue_room_max_fields';
  building_id?: Maybe<Scalars['uuid']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  floor?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  room_name?: Maybe<Scalars['String']['output']>;
  room_number?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Venue_Room_Min_Fields = {
  __typename?: 'venue_room_min_fields';
  building_id?: Maybe<Scalars['uuid']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  floor?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  room_name?: Maybe<Scalars['String']['output']>;
  room_number?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "venue.room" */
export type Venue_Room_Mutation_Response = {
  __typename?: 'venue_room_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Room>;
};

/** on_conflict condition type for table "venue.room" */
export type Venue_Room_On_Conflict = {
  constraint: Venue_Room_Constraint;
  update_columns?: Array<Venue_Room_Update_Column>;
  where?: InputMaybe<Venue_Room_Bool_Exp>;
};

/** Ordering options when selecting data from "venue.room". */
export type Venue_Room_Order_By = {
  building_id?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  facility?: InputMaybe<Order_By>;
  floor?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  room_name?: InputMaybe<Order_By>;
  room_number?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue.room */
export type Venue_Room_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Venue_Room_Prepend_Input = {
  facility?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "venue.room" */
export enum Venue_Room_Select_Column {
  /** column name */
  BuildingId = 'building_id',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Facility = 'facility',
  /** column name */
  Floor = 'floor',
  /** column name */
  Id = 'id',
  /** column name */
  RoomName = 'room_name',
  /** column name */
  RoomNumber = 'room_number',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "venue.room" */
export type Venue_Room_Set_Input = {
  building_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  facility?: InputMaybe<Scalars['jsonb']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  room_name?: InputMaybe<Scalars['String']['input']>;
  room_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Venue_Room_Stddev_Fields = {
  __typename?: 'venue_room_stddev_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Venue_Room_Stddev_Pop_Fields = {
  __typename?: 'venue_room_stddev_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Venue_Room_Stddev_Samp_Fields = {
  __typename?: 'venue_room_stddev_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "venue_room" */
export type Venue_Room_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Room_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Room_Stream_Cursor_Value_Input = {
  building_id?: InputMaybe<Scalars['uuid']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  facility?: InputMaybe<Scalars['jsonb']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  room_name?: InputMaybe<Scalars['String']['input']>;
  room_number?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Venue_Room_Sum_Fields = {
  __typename?: 'venue_room_sum_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "venue.room" */
export enum Venue_Room_Update_Column {
  /** column name */
  BuildingId = 'building_id',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Facility = 'facility',
  /** column name */
  Floor = 'floor',
  /** column name */
  Id = 'id',
  /** column name */
  RoomName = 'room_name',
  /** column name */
  RoomNumber = 'room_number',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Venue_Room_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Venue_Room_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Venue_Room_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Venue_Room_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Venue_Room_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Venue_Room_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Venue_Room_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Room_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Room_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Venue_Room_Var_Pop_Fields = {
  __typename?: 'venue_room_var_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Venue_Room_Var_Samp_Fields = {
  __typename?: 'venue_room_var_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Venue_Room_Variance_Fields = {
  __typename?: 'venue_room_variance_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
};

export type GetUserSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserSessionsQuery = { __typename?: 'query_root', user_session: Array<{ __typename?: 'user_session', id: any, user_id?: any | null, revoked: boolean, ip_address: string, device_info?: any | null, user_agent: string, last_used_at: any, created_at: any, updated_at: any, access_token_expires_at: any, refresh_token_expires_at: any }> };

export type SubscribeToSessionChangesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SubscribeToSessionChangesSubscription = { __typename?: 'subscription_root', user_session: Array<{ __typename?: 'user_session', id: any, user_id?: any | null, revoked: boolean, ip_address: string, last_used_at: any, created_at: any, updated_at: any }> };

export type GetEventRoutinesQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type GetEventRoutinesQuery = { __typename?: 'query_root', event_routine: Array<{ __typename?: 'event_routine', id: any, name: string, day_of_week: number, start_time: any, end_time: any, event_type: string, effective_from: any, effective_to: any, is_active: boolean, metadata?: any | null, course_offering?: { __typename?: 'academic_course_offering', id: any, section: { __typename?: 'academic_section', id: any, name: string, batch: { __typename?: 'academic_batch', name: string } }, course: { __typename?: 'academic_course', id: any, name: string, code: string } } | null }> };

export type GetCurrentUserQueryVariables = Exact<{
  userId: Scalars['uuid']['input'];
}>;


export type GetCurrentUserQuery = { __typename?: 'query_root', user_account_by_pk?: { __typename?: 'user_account', id: any, email?: string | null, phone: string, role: string, created_at: any, updated_at: any, is_active: boolean, profiles: Array<{ __typename?: 'user_profile', first_name: string, last_name: string }> } | null };

export type GetUsersForSelectQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetUsersForSelectQuery = { __typename?: 'query_root', user_account: Array<{ __typename?: 'user_account', id: any, email?: string | null, profiles: Array<{ __typename?: 'user_profile', first_name: string, last_name: string }> }> };

export type GetAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllUsersQuery = { __typename?: 'query_root', user_account: Array<{ __typename?: 'user_account', id: any, email?: string | null, phone: string, role: string, is_active: boolean, created_at: any, updated_at: any }> };

export type UpdateUserStatusMutationVariables = Exact<{
  userId: Scalars['uuid']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type UpdateUserStatusMutation = { __typename?: 'mutation_root', update_user_account_by_pk?: { __typename?: 'user_account', id: any, is_active: boolean } | null };

export type UpdateUserRoleMutationVariables = Exact<{
  userId: Scalars['uuid']['input'];
  role: Scalars['String']['input'];
}>;


export type UpdateUserRoleMutation = { __typename?: 'mutation_root', update_user_account_by_pk?: { __typename?: 'user_account', id: any, role: string } | null };

export type CreateUserMutationVariables = Exact<{
  email?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  role: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  studentId?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['uuid']['input']>;
  batch?: InputMaybe<Scalars['uuid']['input']>;
  section?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type CreateUserMutation = { __typename?: 'mutation_root', insert_user_account_one?: { __typename?: 'user_account', id: any, email?: string | null, phone: string, role: string, is_active: boolean, created_at: any, profiles: Array<{ __typename?: 'user_profile', id: any, first_name: string, last_name: string }> } | null };

export type GetAllStudentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllStudentsQuery = { __typename?: 'query_root', user_profile: Array<{ __typename?: 'user_profile', id: any, user_id: any, first_name: string, last_name: string, student_id?: string | null, department?: { __typename?: 'academic_department', code: string, name: string } | null, batch?: { __typename?: 'academic_batch', name: string } | null, section?: { __typename?: 'academic_section', name: string } | null, user: { __typename?: 'user_account', email?: string | null, phone: string, is_active: boolean } }> };

export type GetStudentQueryVariables = Exact<{
  userId: Scalars['uuid']['input'];
}>;


export type GetStudentQuery = { __typename?: 'query_root', user_profile: Array<{ __typename?: 'user_profile', id: any, user_id: any, first_name: string, last_name: string, student_id?: string | null, gender?: string | null, blood_group?: string | null, address?: string | null, department_id: any, batch_id?: any | null, section_id?: any | null, user: { __typename?: 'user_account', email?: string | null, phone: string } }> };

export type UpdateStudentProfileMutationVariables = Exact<{
  userId: Scalars['uuid']['input'];
  set: User_Profile_Set_Input;
}>;


export type UpdateStudentProfileMutation = { __typename?: 'mutation_root', update_user_profile?: { __typename?: 'user_profile_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'user_profile', id: any }> } | null };

export type GetAllFacultiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllFacultiesQuery = { __typename?: 'query_root', user_faculty: Array<{ __typename?: 'user_faculty', id: any, first_name?: string | null, last_name?: string | null, designation: string, faculty_id: any, department?: { __typename?: 'academic_department', code: string, name: string } | null, user?: { __typename?: 'user_account', email?: string | null, phone: string, is_active: boolean } | null }> };

export type GetFacultyQueryVariables = Exact<{
  userId: Scalars['uuid']['input'];
}>;


export type GetFacultyQuery = { __typename?: 'query_root', user_faculty: Array<{ __typename?: 'user_faculty', id: any, first_name?: string | null, last_name?: string | null, faculty_id: any, designation: string, description?: any | null, department_id: any, user?: { __typename?: 'user_account', email?: string | null, phone: string } | null }> };

export type UpdateFacultyProfileMutationVariables = Exact<{
  userId: Scalars['uuid']['input'];
  set: User_Faculty_Set_Input;
}>;


export type UpdateFacultyProfileMutation = { __typename?: 'mutation_root', update_user_faculty?: { __typename?: 'user_faculty_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'user_faculty', id: any }> } | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'mutation_root', delete_user_account_by_pk?: { __typename?: 'user_account', id: any } | null };

export type UpdateUserAccountMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: User_Account_Set_Input;
}>;


export type UpdateUserAccountMutation = { __typename?: 'mutation_root', update_user_account_by_pk?: { __typename?: 'user_account', id: any } | null };

export type GetDepartmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDepartmentsQuery = { __typename?: 'query_root', academic_department: Array<{ __typename?: 'academic_department', id: any, name: string, code: string, description?: string | null, is_active: boolean, created_at?: any | null, updated_at?: any | null, head_user_id?: any | null, faculty_id?: any | null, faculty?: { __typename?: 'academic_faculty', id: any, name: string } | null, head_of_department?: { __typename?: 'user_account', id: any, email?: string | null, profiles: Array<{ __typename?: 'user_profile', first_name: string, last_name: string }> } | null }> };

export type GetFacultiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFacultiesQuery = { __typename?: 'query_root', academic_faculty: Array<{ __typename?: 'academic_faculty', id: any, name: string }> };

export type GetDepartmentQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetDepartmentQuery = { __typename?: 'query_root', academic_department_by_pk?: { __typename?: 'academic_department', id: any, name: string, code: string, description?: string | null, is_active: boolean, head_user_id?: any | null, faculty_id?: any | null, head_of_department?: { __typename?: 'user_account', id: any, email?: string | null, profiles: Array<{ __typename?: 'user_profile', first_name: string, last_name: string }> } | null } | null };

export type CreateDepartmentMutationVariables = Exact<{
  object: Academic_Department_Insert_Input;
}>;


export type CreateDepartmentMutation = { __typename?: 'mutation_root', insert_academic_department_one?: { __typename?: 'academic_department', id: any, name: string } | null };

export type UpdateDepartmentMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Academic_Department_Set_Input;
}>;


export type UpdateDepartmentMutation = { __typename?: 'mutation_root', update_academic_department_by_pk?: { __typename?: 'academic_department', id: any, name: string } | null };

export type DeleteDepartmentMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteDepartmentMutation = { __typename?: 'mutation_root', delete_academic_department_by_pk?: { __typename?: 'academic_department', id: any } | null };

export type GetDepartmentsForRegistrationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDepartmentsForRegistrationQuery = { __typename?: 'query_root', academic_department: Array<{ __typename?: 'academic_department', id: any, name: string, code: string }> };

export type GetBatchesForRegistrationQueryVariables = Exact<{
  departmentId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type GetBatchesForRegistrationQuery = { __typename?: 'query_root', academic_batch: Array<{ __typename?: 'academic_batch', id: any, name: string }> };

export type GetSectionsForRegistrationQueryVariables = Exact<{
  batchId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type GetSectionsForRegistrationQuery = { __typename?: 'query_root', academic_section: Array<{ __typename?: 'academic_section', id: any, name: string }> };

export type GetBatchesQueryVariables = Exact<{
  departmentId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type GetBatchesQuery = { __typename?: 'query_root', academic_batch: Array<{ __typename?: 'academic_batch', id: any, name: string, departmant_id: any, current_semester: number, year: number, semester_count: number, start_date?: any | null, end_date?: any | null, is_active: boolean }> };

export type GetAllBatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllBatchesQuery = { __typename?: 'query_root', academic_batch: Array<{ __typename?: 'academic_batch', id: any, name: string, departmant_id: any, current_semester: number, year: number, semester_count: number, start_date?: any | null, end_date?: any | null, is_active: boolean, department: { __typename?: 'academic_department', name: string, code: string } }> };

export type GetBatchQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetBatchQuery = { __typename?: 'query_root', academic_batch_by_pk?: { __typename?: 'academic_batch', id: any, name: string, departmant_id: any, current_semester: number, year: number, semester_count: number, start_date?: any | null, end_date?: any | null, is_active: boolean } | null };

export type CreateBatchMutationVariables = Exact<{
  object: Academic_Batch_Insert_Input;
}>;


export type CreateBatchMutation = { __typename?: 'mutation_root', insert_academic_batch_one?: { __typename?: 'academic_batch', id: any, name: string } | null };

export type UpdateBatchMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Academic_Batch_Set_Input;
}>;


export type UpdateBatchMutation = { __typename?: 'mutation_root', update_academic_batch_by_pk?: { __typename?: 'academic_batch', id: any, name: string } | null };

export type DeleteBatchMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteBatchMutation = { __typename?: 'mutation_root', delete_academic_batch_by_pk?: { __typename?: 'academic_batch', id: any } | null };

export type GetSectionsQueryVariables = Exact<{
  batchId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type GetSectionsQuery = { __typename?: 'query_root', academic_section: Array<{ __typename?: 'academic_section', id: any, name: string, batch_id: any, capacity?: number | null, is_active: boolean }> };

export type GetAllSectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllSectionsQuery = { __typename?: 'query_root', academic_section: Array<{ __typename?: 'academic_section', id: any, name: string, batch_id: any, capacity?: number | null, is_active: boolean, batch: { __typename?: 'academic_batch', name: string, department: { __typename?: 'academic_department', name: string } } }> };

export type GetUserSectionQueryVariables = Exact<{
  userId: Scalars['uuid']['input'];
}>;


export type GetUserSectionQuery = { __typename?: 'query_root', user_profile: Array<{ __typename?: 'user_profile', section_id?: any | null }> };

export type GetSectionQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetSectionQuery = { __typename?: 'query_root', academic_section_by_pk?: { __typename?: 'academic_section', id: any, name: string, batch_id: any, capacity?: number | null, is_active: boolean } | null };

export type CreateSectionMutationVariables = Exact<{
  object: Academic_Section_Insert_Input;
}>;


export type CreateSectionMutation = { __typename?: 'mutation_root', insert_academic_section_one?: { __typename?: 'academic_section', id: any, name: string } | null };

export type UpdateSectionMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Academic_Section_Set_Input;
}>;


export type UpdateSectionMutation = { __typename?: 'mutation_root', update_academic_section_by_pk?: { __typename?: 'academic_section', id: any, name: string } | null };

export type DeleteSectionMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteSectionMutation = { __typename?: 'mutation_root', delete_academic_section_by_pk?: { __typename?: 'academic_section', id: any } | null };

export type GetAllCoursesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllCoursesQuery = { __typename?: 'query_root', academic_course: Array<{ __typename?: 'academic_course', id: any, name: string, code: string, description?: string | null, credit_hours: any, semester: number, course_type: string, syllabus_url?: string | null, is_active: boolean, department_id: any, department: { __typename?: 'academic_department', name: string, code: string } }> };

export type GetCourseQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetCourseQuery = { __typename?: 'query_root', academic_course_by_pk?: { __typename?: 'academic_course', id: any, name: string, code: string, description?: string | null, credit_hours: any, semester: number, course_type: string, syllabus_url?: string | null, is_active: boolean, department_id: any } | null };

export type CreateCourseMutationVariables = Exact<{
  object: Academic_Course_Insert_Input;
}>;


export type CreateCourseMutation = { __typename?: 'mutation_root', insert_academic_course_one?: { __typename?: 'academic_course', id: any, name: string } | null };

export type UpdateCourseMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Academic_Course_Set_Input;
}>;


export type UpdateCourseMutation = { __typename?: 'mutation_root', update_academic_course_by_pk?: { __typename?: 'academic_course', id: any, name: string } | null };

export type DeleteCourseMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteCourseMutation = { __typename?: 'mutation_root', delete_academic_course_by_pk?: { __typename?: 'academic_course', id: any } | null };

export type GetCourseOfferingsBySectionQueryVariables = Exact<{
  sectionId: Scalars['uuid']['input'];
}>;


export type GetCourseOfferingsBySectionQuery = { __typename?: 'query_root', academic_course_offering: Array<{ __typename?: 'academic_course_offering', id: any, course_id: any, batch_id: any, section_id: any, teacher_id: any, academic_year: string, is_active: boolean, created_at: any, updated_at: any, course: { __typename?: 'academic_course', id: any, name: string, code: string, credit_hours: any, course_type: string, department: { __typename?: 'academic_department', name: string, code: string } }, faculty?: { __typename?: 'user_faculty', id: any, first_name?: string | null, last_name?: string | null } | null, section: { __typename?: 'academic_section', id: any, name: string, batch: { __typename?: 'academic_batch', id: any, name: string, year: number } } }> };

export type GetCourseOfferingQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetCourseOfferingQuery = { __typename?: 'query_root', academic_course_offering_by_pk?: { __typename?: 'academic_course_offering', id: any, course_id: any, batch_id: any, section_id: any, teacher_id: any, academic_year: string, is_active: boolean, created_at: any, updated_at: any } | null };

export type CreateCourseOfferingMutationVariables = Exact<{
  object: Academic_Course_Offering_Insert_Input;
}>;


export type CreateCourseOfferingMutation = { __typename?: 'mutation_root', insert_academic_course_offering_one?: { __typename?: 'academic_course_offering', id: any, course_id: any, teacher_id: any, academic_year: string } | null };

export type UpdateCourseOfferingMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Academic_Course_Offering_Set_Input;
}>;


export type UpdateCourseOfferingMutation = { __typename?: 'mutation_root', update_academic_course_offering_by_pk?: { __typename?: 'academic_course_offering', id: any, course_id: any, teacher_id: any, academic_year: string } | null };

export type DeleteCourseOfferingMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteCourseOfferingMutation = { __typename?: 'mutation_root', delete_academic_course_offering_by_pk?: { __typename?: 'academic_course_offering', id: any } | null };

export type GetRoutinesBySectionQueryVariables = Exact<{
  sectionId: Scalars['uuid']['input'];
}>;


export type GetRoutinesBySectionQuery = { __typename?: 'query_root', event_routine: Array<{ __typename?: 'event_routine', id: any, name: string, course_offering_id?: any | null, day_of_week: number, start_time: any, end_time: any, event_type: string, effective_from: any, effective_to: any, is_active: boolean, metadata?: any | null, created_at: any, updated_at: any, course_offering?: { __typename?: 'academic_course_offering', id: any, academic_year: string, course: { __typename?: 'academic_course', id: any, name: string, code: string, credit_hours: any }, faculty?: { __typename?: 'user_faculty', id: any, first_name?: string | null, last_name?: string | null, user?: { __typename?: 'user_account', email?: string | null } | null } | null } | null }> };

export type GetRoutineQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetRoutineQuery = { __typename?: 'query_root', event_routine_by_pk?: { __typename?: 'event_routine', id: any, name: string, course_offering_id?: any | null, day_of_week: number, start_time: any, end_time: any, event_type: string, effective_from: any, effective_to: any, is_active: boolean, metadata?: any | null, created_at: any, updated_at: any } | null };

export type CreateRoutineMutationVariables = Exact<{
  object: Event_Routine_Insert_Input;
}>;


export type CreateRoutineMutation = { __typename?: 'mutation_root', insert_event_routine_one?: { __typename?: 'event_routine', id: any, name: string, day_of_week: number, start_time: any, end_time: any } | null };

export type UpdateRoutineMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Event_Routine_Set_Input;
}>;


export type UpdateRoutineMutation = { __typename?: 'mutation_root', update_event_routine_by_pk?: { __typename?: 'event_routine', id: any, name: string, day_of_week: number, start_time: any, end_time: any } | null };

export type DeleteRoutineMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteRoutineMutation = { __typename?: 'mutation_root', delete_event_routine_by_pk?: { __typename?: 'event_routine', id: any } | null };

export type CheckRoutineConflictsQueryVariables = Exact<{
  sectionId: Scalars['uuid']['input'];
  dayOfWeek: Scalars['Int']['input'];
  startTime: Scalars['timetz']['input'];
  endTime: Scalars['timetz']['input'];
  excludeRoutineId?: InputMaybe<Scalars['uuid']['input']>;
}>;


export type CheckRoutineConflictsQuery = { __typename?: 'query_root', section_conflicts: Array<{ __typename?: 'event_routine', id: any, name: string, start_time: any, end_time: any, course_offering?: { __typename?: 'academic_course_offering', course: { __typename?: 'academic_course', code: string, name: string } } | null }> };

export type UpsertDeviceTokenMutationVariables = Exact<{
  user_id: Scalars['uuid']['input'];
  device_id: Scalars['String']['input'];
  provider: Scalars['String']['input'];
  token: Scalars['String']['input'];
  platform: Scalars['String']['input'];
}>;


export type UpsertDeviceTokenMutation = { __typename?: 'mutation_root', insert_user_device_one?: { __typename?: 'user_device', id: any, token: string } | null };

export type DeactivateDeviceMutationVariables = Exact<{
  user_id: Scalars['uuid']['input'];
  device_id: Scalars['String']['input'];
  provider: Scalars['String']['input'];
}>;


export type DeactivateDeviceMutation = { __typename?: 'mutation_root', update_user_device?: { __typename?: 'user_device_mutation_response', affected_rows: number } | null };


export const GetUserSessionsDocument = gql`
    query GetUserSessions {
  user_session {
    id
    user_id
    revoked
    ip_address
    device_info
    user_agent
    last_used_at
    created_at
    updated_at
    access_token_expires_at
    refresh_token_expires_at
  }
}
    `;

/**
 * __useGetUserSessionsQuery__
 *
 * To run a query within a React component, call `useGetUserSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSessionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserSessionsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserSessionsQuery, GetUserSessionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserSessionsQuery, GetUserSessionsQueryVariables>(GetUserSessionsDocument, options);
      }
export function useGetUserSessionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserSessionsQuery, GetUserSessionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserSessionsQuery, GetUserSessionsQueryVariables>(GetUserSessionsDocument, options);
        }
// @ts-ignore
export function useGetUserSessionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserSessionsQuery, GetUserSessionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserSessionsQuery, GetUserSessionsQueryVariables>;
export function useGetUserSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserSessionsQuery, GetUserSessionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserSessionsQuery | undefined, GetUserSessionsQueryVariables>;
export function useGetUserSessionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserSessionsQuery, GetUserSessionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserSessionsQuery, GetUserSessionsQueryVariables>(GetUserSessionsDocument, options);
        }
export type GetUserSessionsQueryHookResult = ReturnType<typeof useGetUserSessionsQuery>;
export type GetUserSessionsLazyQueryHookResult = ReturnType<typeof useGetUserSessionsLazyQuery>;
export type GetUserSessionsSuspenseQueryHookResult = ReturnType<typeof useGetUserSessionsSuspenseQuery>;
export type GetUserSessionsQueryResult = Apollo.QueryResult<GetUserSessionsQuery, GetUserSessionsQueryVariables>;
export const SubscribeToSessionChangesDocument = gql`
    subscription SubscribeToSessionChanges {
  user_session {
    id
    user_id
    revoked
    ip_address
    last_used_at
    created_at
    updated_at
  }
}
    `;

/**
 * __useSubscribeToSessionChangesSubscription__
 *
 * To run a query within a React component, call `useSubscribeToSessionChangesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToSessionChangesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeToSessionChangesSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSubscribeToSessionChangesSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscribeToSessionChangesSubscription, SubscribeToSessionChangesSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscribeToSessionChangesSubscription, SubscribeToSessionChangesSubscriptionVariables>(SubscribeToSessionChangesDocument, options);
      }
export type SubscribeToSessionChangesSubscriptionHookResult = ReturnType<typeof useSubscribeToSessionChangesSubscription>;
export type SubscribeToSessionChangesSubscriptionResult = Apollo.SubscriptionResult<SubscribeToSessionChangesSubscription>;
export const GetEventRoutinesDocument = gql`
    query GetEventRoutines($userId: uuid) {
  event_routine(where: {is_active: {_eq: true}}) {
    id
    name
    day_of_week
    start_time
    end_time
    event_type
    effective_from
    effective_to
    is_active
    metadata
    course_offering {
      id
      section {
        id
        name
        batch {
          name
        }
      }
      course {
        id
        name
        code
      }
    }
  }
}
    `;

/**
 * __useGetEventRoutinesQuery__
 *
 * To run a query within a React component, call `useGetEventRoutinesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventRoutinesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventRoutinesQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetEventRoutinesQuery(baseOptions?: Apollo.QueryHookOptions<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>(GetEventRoutinesDocument, options);
      }
export function useGetEventRoutinesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>(GetEventRoutinesDocument, options);
        }
// @ts-ignore
export function useGetEventRoutinesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>): Apollo.UseSuspenseQueryResult<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>;
export function useGetEventRoutinesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>): Apollo.UseSuspenseQueryResult<GetEventRoutinesQuery | undefined, GetEventRoutinesQueryVariables>;
export function useGetEventRoutinesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>(GetEventRoutinesDocument, options);
        }
export type GetEventRoutinesQueryHookResult = ReturnType<typeof useGetEventRoutinesQuery>;
export type GetEventRoutinesLazyQueryHookResult = ReturnType<typeof useGetEventRoutinesLazyQuery>;
export type GetEventRoutinesSuspenseQueryHookResult = ReturnType<typeof useGetEventRoutinesSuspenseQuery>;
export type GetEventRoutinesQueryResult = Apollo.QueryResult<GetEventRoutinesQuery, GetEventRoutinesQueryVariables>;
export const GetCurrentUserDocument = gql`
    query GetCurrentUser($userId: uuid!) {
  user_account_by_pk(id: $userId) {
    id
    email
    phone
    role
    created_at
    updated_at
    is_active
    profiles {
      first_name
      last_name
    }
  }
}
    `;

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetCurrentUserQuery(baseOptions: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables> & ({ variables: GetCurrentUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
// @ts-ignore
export function useGetCurrentUserSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export function useGetCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>): Apollo.UseSuspenseQueryResult<GetCurrentUserQuery | undefined, GetCurrentUserQueryVariables>;
export function useGetCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserSuspenseQueryHookResult = ReturnType<typeof useGetCurrentUserSuspenseQuery>;
export type GetCurrentUserQueryResult = Apollo.QueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const GetUsersForSelectDocument = gql`
    query GetUsersForSelect($search: String) {
  user_account(
    where: {_or: [{email: {_ilike: $search}}, {phone: {_ilike: $search}}, {profiles: {first_name: {_ilike: $search}}}, {profiles: {last_name: {_ilike: $search}}}], is_active: {_eq: true}}
    limit: 20
  ) {
    id
    email
    profiles {
      first_name
      last_name
    }
  }
}
    `;

/**
 * __useGetUsersForSelectQuery__
 *
 * To run a query within a React component, call `useGetUsersForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersForSelectQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useGetUsersForSelectQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>(GetUsersForSelectDocument, options);
      }
export function useGetUsersForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>(GetUsersForSelectDocument, options);
        }
// @ts-ignore
export function useGetUsersForSelectSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>;
export function useGetUsersForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>): Apollo.UseSuspenseQueryResult<GetUsersForSelectQuery | undefined, GetUsersForSelectQueryVariables>;
export function useGetUsersForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>(GetUsersForSelectDocument, options);
        }
export type GetUsersForSelectQueryHookResult = ReturnType<typeof useGetUsersForSelectQuery>;
export type GetUsersForSelectLazyQueryHookResult = ReturnType<typeof useGetUsersForSelectLazyQuery>;
export type GetUsersForSelectSuspenseQueryHookResult = ReturnType<typeof useGetUsersForSelectSuspenseQuery>;
export type GetUsersForSelectQueryResult = Apollo.QueryResult<GetUsersForSelectQuery, GetUsersForSelectQueryVariables>;
export const GetAllUsersDocument = gql`
    query GetAllUsers {
  user_account(order_by: {created_at: desc}) {
    id
    email
    phone
    role
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetAllUsersQuery__
 *
 * To run a query within a React component, call `useGetAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
      }
export function useGetAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
// @ts-ignore
export function useGetAllUsersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllUsersQuery, GetAllUsersQueryVariables>;
export function useGetAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllUsersQuery | undefined, GetAllUsersQueryVariables>;
export function useGetAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllUsersQuery, GetAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllUsersQuery, GetAllUsersQueryVariables>(GetAllUsersDocument, options);
        }
export type GetAllUsersQueryHookResult = ReturnType<typeof useGetAllUsersQuery>;
export type GetAllUsersLazyQueryHookResult = ReturnType<typeof useGetAllUsersLazyQuery>;
export type GetAllUsersSuspenseQueryHookResult = ReturnType<typeof useGetAllUsersSuspenseQuery>;
export type GetAllUsersQueryResult = Apollo.QueryResult<GetAllUsersQuery, GetAllUsersQueryVariables>;
export const UpdateUserStatusDocument = gql`
    mutation UpdateUserStatus($userId: uuid!, $isActive: Boolean!) {
  update_user_account_by_pk(
    pk_columns: {id: $userId}
    _set: {is_active: $isActive}
  ) {
    id
    is_active
  }
}
    `;
export type UpdateUserStatusMutationFn = Apollo.MutationFunction<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;

/**
 * __useUpdateUserStatusMutation__
 *
 * To run a mutation, you first call `useUpdateUserStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserStatusMutation, { data, loading, error }] = useUpdateUserStatusMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      isActive: // value for 'isActive'
 *   },
 * });
 */
export function useUpdateUserStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>(UpdateUserStatusDocument, options);
      }
export type UpdateUserStatusMutationHookResult = ReturnType<typeof useUpdateUserStatusMutation>;
export type UpdateUserStatusMutationResult = Apollo.MutationResult<UpdateUserStatusMutation>;
export type UpdateUserStatusMutationOptions = Apollo.BaseMutationOptions<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;
export const UpdateUserRoleDocument = gql`
    mutation UpdateUserRole($userId: uuid!, $role: String!) {
  update_user_account_by_pk(pk_columns: {id: $userId}, _set: {role: $role}) {
    id
    role
  }
}
    `;
export type UpdateUserRoleMutationFn = Apollo.MutationFunction<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;

/**
 * __useUpdateUserRoleMutation__
 *
 * To run a mutation, you first call `useUpdateUserRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserRoleMutation, { data, loading, error }] = useUpdateUserRoleMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateUserRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>(UpdateUserRoleDocument, options);
      }
export type UpdateUserRoleMutationHookResult = ReturnType<typeof useUpdateUserRoleMutation>;
export type UpdateUserRoleMutationResult = Apollo.MutationResult<UpdateUserRoleMutation>;
export type UpdateUserRoleMutationOptions = Apollo.BaseMutationOptions<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($email: String, $phone: String!, $role: String!, $password: String, $firstName: String!, $lastName: String!, $studentId: String, $gender: String, $bloodGroup: String, $department: uuid, $batch: uuid, $section: uuid) {
  insert_user_account_one(
    object: {email: $email, phone: $phone, role: $role, password: $password, is_active: true, profiles: {data: {first_name: $firstName, last_name: $lastName, student_id: $studentId, gender: $gender, blood_group: $bloodGroup, department_id: $department, batch_id: $batch, section_id: $section}}}
  ) {
    id
    email
    phone
    role
    is_active
    created_at
    profiles {
      id
      first_name
      last_name
    }
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      email: // value for 'email'
 *      phone: // value for 'phone'
 *      role: // value for 'role'
 *      password: // value for 'password'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      studentId: // value for 'studentId'
 *      gender: // value for 'gender'
 *      bloodGroup: // value for 'bloodGroup'
 *      department: // value for 'department'
 *      batch: // value for 'batch'
 *      section: // value for 'section'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const GetAllStudentsDocument = gql`
    query GetAllStudents {
  user_profile(order_by: {created_at: desc}) {
    id
    user_id
    first_name
    last_name
    student_id
    department {
      code
      name
    }
    batch {
      name
    }
    section {
      name
    }
    user {
      email
      phone
      is_active
    }
  }
}
    `;

/**
 * __useGetAllStudentsQuery__
 *
 * To run a query within a React component, call `useGetAllStudentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllStudentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllStudentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllStudentsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllStudentsQuery, GetAllStudentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllStudentsQuery, GetAllStudentsQueryVariables>(GetAllStudentsDocument, options);
      }
export function useGetAllStudentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllStudentsQuery, GetAllStudentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllStudentsQuery, GetAllStudentsQueryVariables>(GetAllStudentsDocument, options);
        }
// @ts-ignore
export function useGetAllStudentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllStudentsQuery, GetAllStudentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllStudentsQuery, GetAllStudentsQueryVariables>;
export function useGetAllStudentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllStudentsQuery, GetAllStudentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllStudentsQuery | undefined, GetAllStudentsQueryVariables>;
export function useGetAllStudentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllStudentsQuery, GetAllStudentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllStudentsQuery, GetAllStudentsQueryVariables>(GetAllStudentsDocument, options);
        }
export type GetAllStudentsQueryHookResult = ReturnType<typeof useGetAllStudentsQuery>;
export type GetAllStudentsLazyQueryHookResult = ReturnType<typeof useGetAllStudentsLazyQuery>;
export type GetAllStudentsSuspenseQueryHookResult = ReturnType<typeof useGetAllStudentsSuspenseQuery>;
export type GetAllStudentsQueryResult = Apollo.QueryResult<GetAllStudentsQuery, GetAllStudentsQueryVariables>;
export const GetStudentDocument = gql`
    query GetStudent($userId: uuid!) {
  user_profile(where: {user_id: {_eq: $userId}}) {
    id
    user_id
    first_name
    last_name
    student_id
    gender
    blood_group
    address
    department_id
    batch_id
    section_id
    user {
      email
      phone
    }
  }
}
    `;

/**
 * __useGetStudentQuery__
 *
 * To run a query within a React component, call `useGetStudentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStudentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStudentQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetStudentQuery(baseOptions: Apollo.QueryHookOptions<GetStudentQuery, GetStudentQueryVariables> & ({ variables: GetStudentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStudentQuery, GetStudentQueryVariables>(GetStudentDocument, options);
      }
export function useGetStudentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStudentQuery, GetStudentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStudentQuery, GetStudentQueryVariables>(GetStudentDocument, options);
        }
// @ts-ignore
export function useGetStudentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetStudentQuery, GetStudentQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentQuery, GetStudentQueryVariables>;
export function useGetStudentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentQuery, GetStudentQueryVariables>): Apollo.UseSuspenseQueryResult<GetStudentQuery | undefined, GetStudentQueryVariables>;
export function useGetStudentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStudentQuery, GetStudentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStudentQuery, GetStudentQueryVariables>(GetStudentDocument, options);
        }
export type GetStudentQueryHookResult = ReturnType<typeof useGetStudentQuery>;
export type GetStudentLazyQueryHookResult = ReturnType<typeof useGetStudentLazyQuery>;
export type GetStudentSuspenseQueryHookResult = ReturnType<typeof useGetStudentSuspenseQuery>;
export type GetStudentQueryResult = Apollo.QueryResult<GetStudentQuery, GetStudentQueryVariables>;
export const UpdateStudentProfileDocument = gql`
    mutation UpdateStudentProfile($userId: uuid!, $set: user_profile_set_input!) {
  update_user_profile(where: {user_id: {_eq: $userId}}, _set: $set) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type UpdateStudentProfileMutationFn = Apollo.MutationFunction<UpdateStudentProfileMutation, UpdateStudentProfileMutationVariables>;

/**
 * __useUpdateStudentProfileMutation__
 *
 * To run a mutation, you first call `useUpdateStudentProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStudentProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStudentProfileMutation, { data, loading, error }] = useUpdateStudentProfileMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateStudentProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStudentProfileMutation, UpdateStudentProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateStudentProfileMutation, UpdateStudentProfileMutationVariables>(UpdateStudentProfileDocument, options);
      }
export type UpdateStudentProfileMutationHookResult = ReturnType<typeof useUpdateStudentProfileMutation>;
export type UpdateStudentProfileMutationResult = Apollo.MutationResult<UpdateStudentProfileMutation>;
export type UpdateStudentProfileMutationOptions = Apollo.BaseMutationOptions<UpdateStudentProfileMutation, UpdateStudentProfileMutationVariables>;
export const GetAllFacultiesDocument = gql`
    query GetAllFaculties {
  user_faculty(order_by: {created_at: desc}) {
    id
    first_name
    last_name
    designation
    faculty_id
    department {
      code
      name
    }
    user {
      email
      phone
      is_active
    }
  }
}
    `;

/**
 * __useGetAllFacultiesQuery__
 *
 * To run a query within a React component, call `useGetAllFacultiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllFacultiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllFacultiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllFacultiesQuery(baseOptions?: Apollo.QueryHookOptions<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>(GetAllFacultiesDocument, options);
      }
export function useGetAllFacultiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>(GetAllFacultiesDocument, options);
        }
// @ts-ignore
export function useGetAllFacultiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>;
export function useGetAllFacultiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllFacultiesQuery | undefined, GetAllFacultiesQueryVariables>;
export function useGetAllFacultiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>(GetAllFacultiesDocument, options);
        }
export type GetAllFacultiesQueryHookResult = ReturnType<typeof useGetAllFacultiesQuery>;
export type GetAllFacultiesLazyQueryHookResult = ReturnType<typeof useGetAllFacultiesLazyQuery>;
export type GetAllFacultiesSuspenseQueryHookResult = ReturnType<typeof useGetAllFacultiesSuspenseQuery>;
export type GetAllFacultiesQueryResult = Apollo.QueryResult<GetAllFacultiesQuery, GetAllFacultiesQueryVariables>;
export const GetFacultyDocument = gql`
    query GetFaculty($userId: uuid!) {
  user_faculty(where: {user_id: {_eq: $userId}}) {
    id
    first_name
    last_name
    faculty_id
    designation
    description
    department_id
    user {
      email
      phone
    }
  }
}
    `;

/**
 * __useGetFacultyQuery__
 *
 * To run a query within a React component, call `useGetFacultyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacultyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacultyQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetFacultyQuery(baseOptions: Apollo.QueryHookOptions<GetFacultyQuery, GetFacultyQueryVariables> & ({ variables: GetFacultyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFacultyQuery, GetFacultyQueryVariables>(GetFacultyDocument, options);
      }
export function useGetFacultyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFacultyQuery, GetFacultyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFacultyQuery, GetFacultyQueryVariables>(GetFacultyDocument, options);
        }
// @ts-ignore
export function useGetFacultySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFacultyQuery, GetFacultyQueryVariables>): Apollo.UseSuspenseQueryResult<GetFacultyQuery, GetFacultyQueryVariables>;
export function useGetFacultySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFacultyQuery, GetFacultyQueryVariables>): Apollo.UseSuspenseQueryResult<GetFacultyQuery | undefined, GetFacultyQueryVariables>;
export function useGetFacultySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFacultyQuery, GetFacultyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFacultyQuery, GetFacultyQueryVariables>(GetFacultyDocument, options);
        }
export type GetFacultyQueryHookResult = ReturnType<typeof useGetFacultyQuery>;
export type GetFacultyLazyQueryHookResult = ReturnType<typeof useGetFacultyLazyQuery>;
export type GetFacultySuspenseQueryHookResult = ReturnType<typeof useGetFacultySuspenseQuery>;
export type GetFacultyQueryResult = Apollo.QueryResult<GetFacultyQuery, GetFacultyQueryVariables>;
export const UpdateFacultyProfileDocument = gql`
    mutation UpdateFacultyProfile($userId: uuid!, $set: user_faculty_set_input!) {
  update_user_faculty(where: {user_id: {_eq: $userId}}, _set: $set) {
    affected_rows
    returning {
      id
    }
  }
}
    `;
export type UpdateFacultyProfileMutationFn = Apollo.MutationFunction<UpdateFacultyProfileMutation, UpdateFacultyProfileMutationVariables>;

/**
 * __useUpdateFacultyProfileMutation__
 *
 * To run a mutation, you first call `useUpdateFacultyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFacultyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFacultyProfileMutation, { data, loading, error }] = useUpdateFacultyProfileMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateFacultyProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateFacultyProfileMutation, UpdateFacultyProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateFacultyProfileMutation, UpdateFacultyProfileMutationVariables>(UpdateFacultyProfileDocument, options);
      }
export type UpdateFacultyProfileMutationHookResult = ReturnType<typeof useUpdateFacultyProfileMutation>;
export type UpdateFacultyProfileMutationResult = Apollo.MutationResult<UpdateFacultyProfileMutation>;
export type UpdateFacultyProfileMutationOptions = Apollo.BaseMutationOptions<UpdateFacultyProfileMutation, UpdateFacultyProfileMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: uuid!) {
  delete_user_account_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateUserAccountDocument = gql`
    mutation UpdateUserAccount($id: uuid!, $set: user_account_set_input!) {
  update_user_account_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
  }
}
    `;
export type UpdateUserAccountMutationFn = Apollo.MutationFunction<UpdateUserAccountMutation, UpdateUserAccountMutationVariables>;

/**
 * __useUpdateUserAccountMutation__
 *
 * To run a mutation, you first call `useUpdateUserAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserAccountMutation, { data, loading, error }] = useUpdateUserAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateUserAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserAccountMutation, UpdateUserAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserAccountMutation, UpdateUserAccountMutationVariables>(UpdateUserAccountDocument, options);
      }
export type UpdateUserAccountMutationHookResult = ReturnType<typeof useUpdateUserAccountMutation>;
export type UpdateUserAccountMutationResult = Apollo.MutationResult<UpdateUserAccountMutation>;
export type UpdateUserAccountMutationOptions = Apollo.BaseMutationOptions<UpdateUserAccountMutation, UpdateUserAccountMutationVariables>;
export const GetDepartmentsDocument = gql`
    query GetDepartments {
  academic_department(order_by: {name: asc}) {
    id
    name
    code
    description
    is_active
    created_at
    updated_at
    head_user_id
    faculty_id
    faculty {
      id
      name
    }
    head_of_department {
      id
      email
      profiles {
        first_name
        last_name
      }
    }
  }
}
    `;

/**
 * __useGetDepartmentsQuery__
 *
 * To run a query within a React component, call `useGetDepartmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDepartmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDepartmentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDepartmentsQuery(baseOptions?: Apollo.QueryHookOptions<GetDepartmentsQuery, GetDepartmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDepartmentsQuery, GetDepartmentsQueryVariables>(GetDepartmentsDocument, options);
      }
export function useGetDepartmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDepartmentsQuery, GetDepartmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDepartmentsQuery, GetDepartmentsQueryVariables>(GetDepartmentsDocument, options);
        }
// @ts-ignore
export function useGetDepartmentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDepartmentsQuery, GetDepartmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentsQuery, GetDepartmentsQueryVariables>;
export function useGetDepartmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentsQuery, GetDepartmentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentsQuery | undefined, GetDepartmentsQueryVariables>;
export function useGetDepartmentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentsQuery, GetDepartmentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDepartmentsQuery, GetDepartmentsQueryVariables>(GetDepartmentsDocument, options);
        }
export type GetDepartmentsQueryHookResult = ReturnType<typeof useGetDepartmentsQuery>;
export type GetDepartmentsLazyQueryHookResult = ReturnType<typeof useGetDepartmentsLazyQuery>;
export type GetDepartmentsSuspenseQueryHookResult = ReturnType<typeof useGetDepartmentsSuspenseQuery>;
export type GetDepartmentsQueryResult = Apollo.QueryResult<GetDepartmentsQuery, GetDepartmentsQueryVariables>;
export const GetFacultiesDocument = gql`
    query GetFaculties {
  academic_faculty(order_by: {name: asc}) {
    id
    name
  }
}
    `;

/**
 * __useGetFacultiesQuery__
 *
 * To run a query within a React component, call `useGetFacultiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFacultiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFacultiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFacultiesQuery(baseOptions?: Apollo.QueryHookOptions<GetFacultiesQuery, GetFacultiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFacultiesQuery, GetFacultiesQueryVariables>(GetFacultiesDocument, options);
      }
export function useGetFacultiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFacultiesQuery, GetFacultiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFacultiesQuery, GetFacultiesQueryVariables>(GetFacultiesDocument, options);
        }
// @ts-ignore
export function useGetFacultiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetFacultiesQuery, GetFacultiesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFacultiesQuery, GetFacultiesQueryVariables>;
export function useGetFacultiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFacultiesQuery, GetFacultiesQueryVariables>): Apollo.UseSuspenseQueryResult<GetFacultiesQuery | undefined, GetFacultiesQueryVariables>;
export function useGetFacultiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFacultiesQuery, GetFacultiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFacultiesQuery, GetFacultiesQueryVariables>(GetFacultiesDocument, options);
        }
export type GetFacultiesQueryHookResult = ReturnType<typeof useGetFacultiesQuery>;
export type GetFacultiesLazyQueryHookResult = ReturnType<typeof useGetFacultiesLazyQuery>;
export type GetFacultiesSuspenseQueryHookResult = ReturnType<typeof useGetFacultiesSuspenseQuery>;
export type GetFacultiesQueryResult = Apollo.QueryResult<GetFacultiesQuery, GetFacultiesQueryVariables>;
export const GetDepartmentDocument = gql`
    query GetDepartment($id: uuid!) {
  academic_department_by_pk(id: $id) {
    id
    name
    code
    description
    is_active
    head_user_id
    faculty_id
    head_of_department {
      id
      email
      profiles {
        first_name
        last_name
      }
    }
  }
}
    `;

/**
 * __useGetDepartmentQuery__
 *
 * To run a query within a React component, call `useGetDepartmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDepartmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDepartmentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetDepartmentQuery(baseOptions: Apollo.QueryHookOptions<GetDepartmentQuery, GetDepartmentQueryVariables> & ({ variables: GetDepartmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDepartmentQuery, GetDepartmentQueryVariables>(GetDepartmentDocument, options);
      }
export function useGetDepartmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDepartmentQuery, GetDepartmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDepartmentQuery, GetDepartmentQueryVariables>(GetDepartmentDocument, options);
        }
// @ts-ignore
export function useGetDepartmentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDepartmentQuery, GetDepartmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentQuery, GetDepartmentQueryVariables>;
export function useGetDepartmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentQuery, GetDepartmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentQuery | undefined, GetDepartmentQueryVariables>;
export function useGetDepartmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentQuery, GetDepartmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDepartmentQuery, GetDepartmentQueryVariables>(GetDepartmentDocument, options);
        }
export type GetDepartmentQueryHookResult = ReturnType<typeof useGetDepartmentQuery>;
export type GetDepartmentLazyQueryHookResult = ReturnType<typeof useGetDepartmentLazyQuery>;
export type GetDepartmentSuspenseQueryHookResult = ReturnType<typeof useGetDepartmentSuspenseQuery>;
export type GetDepartmentQueryResult = Apollo.QueryResult<GetDepartmentQuery, GetDepartmentQueryVariables>;
export const CreateDepartmentDocument = gql`
    mutation CreateDepartment($object: academic_department_insert_input!) {
  insert_academic_department_one(object: $object) {
    id
    name
  }
}
    `;
export type CreateDepartmentMutationFn = Apollo.MutationFunction<CreateDepartmentMutation, CreateDepartmentMutationVariables>;

/**
 * __useCreateDepartmentMutation__
 *
 * To run a mutation, you first call `useCreateDepartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDepartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDepartmentMutation, { data, loading, error }] = useCreateDepartmentMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateDepartmentMutation(baseOptions?: Apollo.MutationHookOptions<CreateDepartmentMutation, CreateDepartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDepartmentMutation, CreateDepartmentMutationVariables>(CreateDepartmentDocument, options);
      }
export type CreateDepartmentMutationHookResult = ReturnType<typeof useCreateDepartmentMutation>;
export type CreateDepartmentMutationResult = Apollo.MutationResult<CreateDepartmentMutation>;
export type CreateDepartmentMutationOptions = Apollo.BaseMutationOptions<CreateDepartmentMutation, CreateDepartmentMutationVariables>;
export const UpdateDepartmentDocument = gql`
    mutation UpdateDepartment($id: uuid!, $set: academic_department_set_input!) {
  update_academic_department_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
  }
}
    `;
export type UpdateDepartmentMutationFn = Apollo.MutationFunction<UpdateDepartmentMutation, UpdateDepartmentMutationVariables>;

/**
 * __useUpdateDepartmentMutation__
 *
 * To run a mutation, you first call `useUpdateDepartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDepartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDepartmentMutation, { data, loading, error }] = useUpdateDepartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateDepartmentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDepartmentMutation, UpdateDepartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDepartmentMutation, UpdateDepartmentMutationVariables>(UpdateDepartmentDocument, options);
      }
export type UpdateDepartmentMutationHookResult = ReturnType<typeof useUpdateDepartmentMutation>;
export type UpdateDepartmentMutationResult = Apollo.MutationResult<UpdateDepartmentMutation>;
export type UpdateDepartmentMutationOptions = Apollo.BaseMutationOptions<UpdateDepartmentMutation, UpdateDepartmentMutationVariables>;
export const DeleteDepartmentDocument = gql`
    mutation DeleteDepartment($id: uuid!) {
  delete_academic_department_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteDepartmentMutationFn = Apollo.MutationFunction<DeleteDepartmentMutation, DeleteDepartmentMutationVariables>;

/**
 * __useDeleteDepartmentMutation__
 *
 * To run a mutation, you first call `useDeleteDepartmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDepartmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDepartmentMutation, { data, loading, error }] = useDeleteDepartmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDepartmentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDepartmentMutation, DeleteDepartmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDepartmentMutation, DeleteDepartmentMutationVariables>(DeleteDepartmentDocument, options);
      }
export type DeleteDepartmentMutationHookResult = ReturnType<typeof useDeleteDepartmentMutation>;
export type DeleteDepartmentMutationResult = Apollo.MutationResult<DeleteDepartmentMutation>;
export type DeleteDepartmentMutationOptions = Apollo.BaseMutationOptions<DeleteDepartmentMutation, DeleteDepartmentMutationVariables>;
export const GetDepartmentsForRegistrationDocument = gql`
    query GetDepartmentsForRegistration {
  academic_department(order_by: {name: asc}, where: {is_active: {_eq: true}}) {
    id
    name
    code
  }
}
    `;

/**
 * __useGetDepartmentsForRegistrationQuery__
 *
 * To run a query within a React component, call `useGetDepartmentsForRegistrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDepartmentsForRegistrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDepartmentsForRegistrationQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDepartmentsForRegistrationQuery(baseOptions?: Apollo.QueryHookOptions<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>(GetDepartmentsForRegistrationDocument, options);
      }
export function useGetDepartmentsForRegistrationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>(GetDepartmentsForRegistrationDocument, options);
        }
// @ts-ignore
export function useGetDepartmentsForRegistrationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>;
export function useGetDepartmentsForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetDepartmentsForRegistrationQuery | undefined, GetDepartmentsForRegistrationQueryVariables>;
export function useGetDepartmentsForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>(GetDepartmentsForRegistrationDocument, options);
        }
export type GetDepartmentsForRegistrationQueryHookResult = ReturnType<typeof useGetDepartmentsForRegistrationQuery>;
export type GetDepartmentsForRegistrationLazyQueryHookResult = ReturnType<typeof useGetDepartmentsForRegistrationLazyQuery>;
export type GetDepartmentsForRegistrationSuspenseQueryHookResult = ReturnType<typeof useGetDepartmentsForRegistrationSuspenseQuery>;
export type GetDepartmentsForRegistrationQueryResult = Apollo.QueryResult<GetDepartmentsForRegistrationQuery, GetDepartmentsForRegistrationQueryVariables>;
export const GetBatchesForRegistrationDocument = gql`
    query GetBatchesForRegistration($departmentId: uuid) {
  academic_batch(
    where: {departmant_id: {_eq: $departmentId}, is_active: {_eq: true}}
    order_by: {year: desc, name: asc}
  ) {
    id
    name
  }
}
    `;

/**
 * __useGetBatchesForRegistrationQuery__
 *
 * To run a query within a React component, call `useGetBatchesForRegistrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBatchesForRegistrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBatchesForRegistrationQuery({
 *   variables: {
 *      departmentId: // value for 'departmentId'
 *   },
 * });
 */
export function useGetBatchesForRegistrationQuery(baseOptions?: Apollo.QueryHookOptions<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>(GetBatchesForRegistrationDocument, options);
      }
export function useGetBatchesForRegistrationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>(GetBatchesForRegistrationDocument, options);
        }
// @ts-ignore
export function useGetBatchesForRegistrationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>;
export function useGetBatchesForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchesForRegistrationQuery | undefined, GetBatchesForRegistrationQueryVariables>;
export function useGetBatchesForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>(GetBatchesForRegistrationDocument, options);
        }
export type GetBatchesForRegistrationQueryHookResult = ReturnType<typeof useGetBatchesForRegistrationQuery>;
export type GetBatchesForRegistrationLazyQueryHookResult = ReturnType<typeof useGetBatchesForRegistrationLazyQuery>;
export type GetBatchesForRegistrationSuspenseQueryHookResult = ReturnType<typeof useGetBatchesForRegistrationSuspenseQuery>;
export type GetBatchesForRegistrationQueryResult = Apollo.QueryResult<GetBatchesForRegistrationQuery, GetBatchesForRegistrationQueryVariables>;
export const GetSectionsForRegistrationDocument = gql`
    query GetSectionsForRegistration($batchId: uuid) {
  academic_section(
    where: {batch_id: {_eq: $batchId}, is_active: {_eq: true}}
    order_by: {name: asc}
  ) {
    id
    name
  }
}
    `;

/**
 * __useGetSectionsForRegistrationQuery__
 *
 * To run a query within a React component, call `useGetSectionsForRegistrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSectionsForRegistrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSectionsForRegistrationQuery({
 *   variables: {
 *      batchId: // value for 'batchId'
 *   },
 * });
 */
export function useGetSectionsForRegistrationQuery(baseOptions?: Apollo.QueryHookOptions<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>(GetSectionsForRegistrationDocument, options);
      }
export function useGetSectionsForRegistrationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>(GetSectionsForRegistrationDocument, options);
        }
// @ts-ignore
export function useGetSectionsForRegistrationSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>;
export function useGetSectionsForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionsForRegistrationQuery | undefined, GetSectionsForRegistrationQueryVariables>;
export function useGetSectionsForRegistrationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>(GetSectionsForRegistrationDocument, options);
        }
export type GetSectionsForRegistrationQueryHookResult = ReturnType<typeof useGetSectionsForRegistrationQuery>;
export type GetSectionsForRegistrationLazyQueryHookResult = ReturnType<typeof useGetSectionsForRegistrationLazyQuery>;
export type GetSectionsForRegistrationSuspenseQueryHookResult = ReturnType<typeof useGetSectionsForRegistrationSuspenseQuery>;
export type GetSectionsForRegistrationQueryResult = Apollo.QueryResult<GetSectionsForRegistrationQuery, GetSectionsForRegistrationQueryVariables>;
export const GetBatchesDocument = gql`
    query GetBatches($departmentId: uuid) {
  academic_batch(
    where: {departmant_id: {_eq: $departmentId}}
    order_by: {year: desc, name: asc}
  ) {
    id
    name
    departmant_id
    current_semester
    year
    semester_count
    start_date
    end_date
    is_active
  }
}
    `;

/**
 * __useGetBatchesQuery__
 *
 * To run a query within a React component, call `useGetBatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBatchesQuery({
 *   variables: {
 *      departmentId: // value for 'departmentId'
 *   },
 * });
 */
export function useGetBatchesQuery(baseOptions?: Apollo.QueryHookOptions<GetBatchesQuery, GetBatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBatchesQuery, GetBatchesQueryVariables>(GetBatchesDocument, options);
      }
export function useGetBatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBatchesQuery, GetBatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBatchesQuery, GetBatchesQueryVariables>(GetBatchesDocument, options);
        }
// @ts-ignore
export function useGetBatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBatchesQuery, GetBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchesQuery, GetBatchesQueryVariables>;
export function useGetBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchesQuery, GetBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchesQuery | undefined, GetBatchesQueryVariables>;
export function useGetBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchesQuery, GetBatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBatchesQuery, GetBatchesQueryVariables>(GetBatchesDocument, options);
        }
export type GetBatchesQueryHookResult = ReturnType<typeof useGetBatchesQuery>;
export type GetBatchesLazyQueryHookResult = ReturnType<typeof useGetBatchesLazyQuery>;
export type GetBatchesSuspenseQueryHookResult = ReturnType<typeof useGetBatchesSuspenseQuery>;
export type GetBatchesQueryResult = Apollo.QueryResult<GetBatchesQuery, GetBatchesQueryVariables>;
export const GetAllBatchesDocument = gql`
    query GetAllBatches {
  academic_batch(order_by: {year: desc, name: asc}) {
    id
    name
    departmant_id
    department {
      name
      code
    }
    current_semester
    year
    semester_count
    start_date
    end_date
    is_active
  }
}
    `;

/**
 * __useGetAllBatchesQuery__
 *
 * To run a query within a React component, call `useGetAllBatchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllBatchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllBatchesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllBatchesQuery(baseOptions?: Apollo.QueryHookOptions<GetAllBatchesQuery, GetAllBatchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllBatchesQuery, GetAllBatchesQueryVariables>(GetAllBatchesDocument, options);
      }
export function useGetAllBatchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllBatchesQuery, GetAllBatchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllBatchesQuery, GetAllBatchesQueryVariables>(GetAllBatchesDocument, options);
        }
// @ts-ignore
export function useGetAllBatchesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllBatchesQuery, GetAllBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllBatchesQuery, GetAllBatchesQueryVariables>;
export function useGetAllBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllBatchesQuery, GetAllBatchesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllBatchesQuery | undefined, GetAllBatchesQueryVariables>;
export function useGetAllBatchesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllBatchesQuery, GetAllBatchesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllBatchesQuery, GetAllBatchesQueryVariables>(GetAllBatchesDocument, options);
        }
export type GetAllBatchesQueryHookResult = ReturnType<typeof useGetAllBatchesQuery>;
export type GetAllBatchesLazyQueryHookResult = ReturnType<typeof useGetAllBatchesLazyQuery>;
export type GetAllBatchesSuspenseQueryHookResult = ReturnType<typeof useGetAllBatchesSuspenseQuery>;
export type GetAllBatchesQueryResult = Apollo.QueryResult<GetAllBatchesQuery, GetAllBatchesQueryVariables>;
export const GetBatchDocument = gql`
    query GetBatch($id: uuid!) {
  academic_batch_by_pk(id: $id) {
    id
    name
    departmant_id
    current_semester
    year
    semester_count
    start_date
    end_date
    is_active
  }
}
    `;

/**
 * __useGetBatchQuery__
 *
 * To run a query within a React component, call `useGetBatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBatchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetBatchQuery(baseOptions: Apollo.QueryHookOptions<GetBatchQuery, GetBatchQueryVariables> & ({ variables: GetBatchQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBatchQuery, GetBatchQueryVariables>(GetBatchDocument, options);
      }
export function useGetBatchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBatchQuery, GetBatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBatchQuery, GetBatchQueryVariables>(GetBatchDocument, options);
        }
// @ts-ignore
export function useGetBatchSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetBatchQuery, GetBatchQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchQuery, GetBatchQueryVariables>;
export function useGetBatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchQuery, GetBatchQueryVariables>): Apollo.UseSuspenseQueryResult<GetBatchQuery | undefined, GetBatchQueryVariables>;
export function useGetBatchSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBatchQuery, GetBatchQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBatchQuery, GetBatchQueryVariables>(GetBatchDocument, options);
        }
export type GetBatchQueryHookResult = ReturnType<typeof useGetBatchQuery>;
export type GetBatchLazyQueryHookResult = ReturnType<typeof useGetBatchLazyQuery>;
export type GetBatchSuspenseQueryHookResult = ReturnType<typeof useGetBatchSuspenseQuery>;
export type GetBatchQueryResult = Apollo.QueryResult<GetBatchQuery, GetBatchQueryVariables>;
export const CreateBatchDocument = gql`
    mutation CreateBatch($object: academic_batch_insert_input!) {
  insert_academic_batch_one(object: $object) {
    id
    name
  }
}
    `;
export type CreateBatchMutationFn = Apollo.MutationFunction<CreateBatchMutation, CreateBatchMutationVariables>;

/**
 * __useCreateBatchMutation__
 *
 * To run a mutation, you first call `useCreateBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBatchMutation, { data, loading, error }] = useCreateBatchMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateBatchMutation(baseOptions?: Apollo.MutationHookOptions<CreateBatchMutation, CreateBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBatchMutation, CreateBatchMutationVariables>(CreateBatchDocument, options);
      }
export type CreateBatchMutationHookResult = ReturnType<typeof useCreateBatchMutation>;
export type CreateBatchMutationResult = Apollo.MutationResult<CreateBatchMutation>;
export type CreateBatchMutationOptions = Apollo.BaseMutationOptions<CreateBatchMutation, CreateBatchMutationVariables>;
export const UpdateBatchDocument = gql`
    mutation UpdateBatch($id: uuid!, $set: academic_batch_set_input!) {
  update_academic_batch_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
  }
}
    `;
export type UpdateBatchMutationFn = Apollo.MutationFunction<UpdateBatchMutation, UpdateBatchMutationVariables>;

/**
 * __useUpdateBatchMutation__
 *
 * To run a mutation, you first call `useUpdateBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBatchMutation, { data, loading, error }] = useUpdateBatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateBatchMutation(baseOptions?: Apollo.MutationHookOptions<UpdateBatchMutation, UpdateBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateBatchMutation, UpdateBatchMutationVariables>(UpdateBatchDocument, options);
      }
export type UpdateBatchMutationHookResult = ReturnType<typeof useUpdateBatchMutation>;
export type UpdateBatchMutationResult = Apollo.MutationResult<UpdateBatchMutation>;
export type UpdateBatchMutationOptions = Apollo.BaseMutationOptions<UpdateBatchMutation, UpdateBatchMutationVariables>;
export const DeleteBatchDocument = gql`
    mutation DeleteBatch($id: uuid!) {
  delete_academic_batch_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteBatchMutationFn = Apollo.MutationFunction<DeleteBatchMutation, DeleteBatchMutationVariables>;

/**
 * __useDeleteBatchMutation__
 *
 * To run a mutation, you first call `useDeleteBatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteBatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteBatchMutation, { data, loading, error }] = useDeleteBatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteBatchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteBatchMutation, DeleteBatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteBatchMutation, DeleteBatchMutationVariables>(DeleteBatchDocument, options);
      }
export type DeleteBatchMutationHookResult = ReturnType<typeof useDeleteBatchMutation>;
export type DeleteBatchMutationResult = Apollo.MutationResult<DeleteBatchMutation>;
export type DeleteBatchMutationOptions = Apollo.BaseMutationOptions<DeleteBatchMutation, DeleteBatchMutationVariables>;
export const GetSectionsDocument = gql`
    query GetSections($batchId: uuid) {
  academic_section(where: {batch_id: {_eq: $batchId}}, order_by: {name: asc}) {
    id
    name
    batch_id
    capacity
    is_active
  }
}
    `;

/**
 * __useGetSectionsQuery__
 *
 * To run a query within a React component, call `useGetSectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSectionsQuery({
 *   variables: {
 *      batchId: // value for 'batchId'
 *   },
 * });
 */
export function useGetSectionsQuery(baseOptions?: Apollo.QueryHookOptions<GetSectionsQuery, GetSectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSectionsQuery, GetSectionsQueryVariables>(GetSectionsDocument, options);
      }
export function useGetSectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSectionsQuery, GetSectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSectionsQuery, GetSectionsQueryVariables>(GetSectionsDocument, options);
        }
// @ts-ignore
export function useGetSectionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSectionsQuery, GetSectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionsQuery, GetSectionsQueryVariables>;
export function useGetSectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionsQuery, GetSectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionsQuery | undefined, GetSectionsQueryVariables>;
export function useGetSectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionsQuery, GetSectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSectionsQuery, GetSectionsQueryVariables>(GetSectionsDocument, options);
        }
export type GetSectionsQueryHookResult = ReturnType<typeof useGetSectionsQuery>;
export type GetSectionsLazyQueryHookResult = ReturnType<typeof useGetSectionsLazyQuery>;
export type GetSectionsSuspenseQueryHookResult = ReturnType<typeof useGetSectionsSuspenseQuery>;
export type GetSectionsQueryResult = Apollo.QueryResult<GetSectionsQuery, GetSectionsQueryVariables>;
export const GetAllSectionsDocument = gql`
    query GetAllSections {
  academic_section(order_by: {created_at: desc}) {
    id
    name
    batch_id
    batch {
      name
      department {
        name
      }
    }
    capacity
    is_active
  }
}
    `;

/**
 * __useGetAllSectionsQuery__
 *
 * To run a query within a React component, call `useGetAllSectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllSectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllSectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllSectionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllSectionsQuery, GetAllSectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllSectionsQuery, GetAllSectionsQueryVariables>(GetAllSectionsDocument, options);
      }
export function useGetAllSectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllSectionsQuery, GetAllSectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllSectionsQuery, GetAllSectionsQueryVariables>(GetAllSectionsDocument, options);
        }
// @ts-ignore
export function useGetAllSectionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllSectionsQuery, GetAllSectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllSectionsQuery, GetAllSectionsQueryVariables>;
export function useGetAllSectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllSectionsQuery, GetAllSectionsQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllSectionsQuery | undefined, GetAllSectionsQueryVariables>;
export function useGetAllSectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllSectionsQuery, GetAllSectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllSectionsQuery, GetAllSectionsQueryVariables>(GetAllSectionsDocument, options);
        }
export type GetAllSectionsQueryHookResult = ReturnType<typeof useGetAllSectionsQuery>;
export type GetAllSectionsLazyQueryHookResult = ReturnType<typeof useGetAllSectionsLazyQuery>;
export type GetAllSectionsSuspenseQueryHookResult = ReturnType<typeof useGetAllSectionsSuspenseQuery>;
export type GetAllSectionsQueryResult = Apollo.QueryResult<GetAllSectionsQuery, GetAllSectionsQueryVariables>;
export const GetUserSectionDocument = gql`
    query GetUserSection($userId: uuid!) {
  user_profile(where: {user_id: {_eq: $userId}}) {
    section_id
  }
}
    `;

/**
 * __useGetUserSectionQuery__
 *
 * To run a query within a React component, call `useGetUserSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSectionQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserSectionQuery(baseOptions: Apollo.QueryHookOptions<GetUserSectionQuery, GetUserSectionQueryVariables> & ({ variables: GetUserSectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserSectionQuery, GetUserSectionQueryVariables>(GetUserSectionDocument, options);
      }
export function useGetUserSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserSectionQuery, GetUserSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserSectionQuery, GetUserSectionQueryVariables>(GetUserSectionDocument, options);
        }
// @ts-ignore
export function useGetUserSectionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetUserSectionQuery, GetUserSectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserSectionQuery, GetUserSectionQueryVariables>;
export function useGetUserSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserSectionQuery, GetUserSectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetUserSectionQuery | undefined, GetUserSectionQueryVariables>;
export function useGetUserSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserSectionQuery, GetUserSectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserSectionQuery, GetUserSectionQueryVariables>(GetUserSectionDocument, options);
        }
export type GetUserSectionQueryHookResult = ReturnType<typeof useGetUserSectionQuery>;
export type GetUserSectionLazyQueryHookResult = ReturnType<typeof useGetUserSectionLazyQuery>;
export type GetUserSectionSuspenseQueryHookResult = ReturnType<typeof useGetUserSectionSuspenseQuery>;
export type GetUserSectionQueryResult = Apollo.QueryResult<GetUserSectionQuery, GetUserSectionQueryVariables>;
export const GetSectionDocument = gql`
    query GetSection($id: uuid!) {
  academic_section_by_pk(id: $id) {
    id
    name
    batch_id
    capacity
    is_active
  }
}
    `;

/**
 * __useGetSectionQuery__
 *
 * To run a query within a React component, call `useGetSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSectionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSectionQuery(baseOptions: Apollo.QueryHookOptions<GetSectionQuery, GetSectionQueryVariables> & ({ variables: GetSectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSectionQuery, GetSectionQueryVariables>(GetSectionDocument, options);
      }
export function useGetSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSectionQuery, GetSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSectionQuery, GetSectionQueryVariables>(GetSectionDocument, options);
        }
// @ts-ignore
export function useGetSectionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetSectionQuery, GetSectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionQuery, GetSectionQueryVariables>;
export function useGetSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionQuery, GetSectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetSectionQuery | undefined, GetSectionQueryVariables>;
export function useGetSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSectionQuery, GetSectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSectionQuery, GetSectionQueryVariables>(GetSectionDocument, options);
        }
export type GetSectionQueryHookResult = ReturnType<typeof useGetSectionQuery>;
export type GetSectionLazyQueryHookResult = ReturnType<typeof useGetSectionLazyQuery>;
export type GetSectionSuspenseQueryHookResult = ReturnType<typeof useGetSectionSuspenseQuery>;
export type GetSectionQueryResult = Apollo.QueryResult<GetSectionQuery, GetSectionQueryVariables>;
export const CreateSectionDocument = gql`
    mutation CreateSection($object: academic_section_insert_input!) {
  insert_academic_section_one(object: $object) {
    id
    name
  }
}
    `;
export type CreateSectionMutationFn = Apollo.MutationFunction<CreateSectionMutation, CreateSectionMutationVariables>;

/**
 * __useCreateSectionMutation__
 *
 * To run a mutation, you first call `useCreateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSectionMutation, { data, loading, error }] = useCreateSectionMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateSectionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSectionMutation, CreateSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSectionMutation, CreateSectionMutationVariables>(CreateSectionDocument, options);
      }
export type CreateSectionMutationHookResult = ReturnType<typeof useCreateSectionMutation>;
export type CreateSectionMutationResult = Apollo.MutationResult<CreateSectionMutation>;
export type CreateSectionMutationOptions = Apollo.BaseMutationOptions<CreateSectionMutation, CreateSectionMutationVariables>;
export const UpdateSectionDocument = gql`
    mutation UpdateSection($id: uuid!, $set: academic_section_set_input!) {
  update_academic_section_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
  }
}
    `;
export type UpdateSectionMutationFn = Apollo.MutationFunction<UpdateSectionMutation, UpdateSectionMutationVariables>;

/**
 * __useUpdateSectionMutation__
 *
 * To run a mutation, you first call `useUpdateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSectionMutation, { data, loading, error }] = useUpdateSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateSectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSectionMutation, UpdateSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSectionMutation, UpdateSectionMutationVariables>(UpdateSectionDocument, options);
      }
export type UpdateSectionMutationHookResult = ReturnType<typeof useUpdateSectionMutation>;
export type UpdateSectionMutationResult = Apollo.MutationResult<UpdateSectionMutation>;
export type UpdateSectionMutationOptions = Apollo.BaseMutationOptions<UpdateSectionMutation, UpdateSectionMutationVariables>;
export const DeleteSectionDocument = gql`
    mutation DeleteSection($id: uuid!) {
  delete_academic_section_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteSectionMutationFn = Apollo.MutationFunction<DeleteSectionMutation, DeleteSectionMutationVariables>;

/**
 * __useDeleteSectionMutation__
 *
 * To run a mutation, you first call `useDeleteSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectionMutation, { data, loading, error }] = useDeleteSectionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSectionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSectionMutation, DeleteSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSectionMutation, DeleteSectionMutationVariables>(DeleteSectionDocument, options);
      }
export type DeleteSectionMutationHookResult = ReturnType<typeof useDeleteSectionMutation>;
export type DeleteSectionMutationResult = Apollo.MutationResult<DeleteSectionMutation>;
export type DeleteSectionMutationOptions = Apollo.BaseMutationOptions<DeleteSectionMutation, DeleteSectionMutationVariables>;
export const GetAllCoursesDocument = gql`
    query GetAllCourses {
  academic_course(order_by: {code: asc}) {
    id
    name
    code
    description
    credit_hours
    semester
    course_type
    syllabus_url
    is_active
    department_id
    department {
      name
      code
    }
  }
}
    `;

/**
 * __useGetAllCoursesQuery__
 *
 * To run a query within a React component, call `useGetAllCoursesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllCoursesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllCoursesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllCoursesQuery(baseOptions?: Apollo.QueryHookOptions<GetAllCoursesQuery, GetAllCoursesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllCoursesQuery, GetAllCoursesQueryVariables>(GetAllCoursesDocument, options);
      }
export function useGetAllCoursesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllCoursesQuery, GetAllCoursesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllCoursesQuery, GetAllCoursesQueryVariables>(GetAllCoursesDocument, options);
        }
// @ts-ignore
export function useGetAllCoursesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetAllCoursesQuery, GetAllCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllCoursesQuery, GetAllCoursesQueryVariables>;
export function useGetAllCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllCoursesQuery, GetAllCoursesQueryVariables>): Apollo.UseSuspenseQueryResult<GetAllCoursesQuery | undefined, GetAllCoursesQueryVariables>;
export function useGetAllCoursesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllCoursesQuery, GetAllCoursesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllCoursesQuery, GetAllCoursesQueryVariables>(GetAllCoursesDocument, options);
        }
export type GetAllCoursesQueryHookResult = ReturnType<typeof useGetAllCoursesQuery>;
export type GetAllCoursesLazyQueryHookResult = ReturnType<typeof useGetAllCoursesLazyQuery>;
export type GetAllCoursesSuspenseQueryHookResult = ReturnType<typeof useGetAllCoursesSuspenseQuery>;
export type GetAllCoursesQueryResult = Apollo.QueryResult<GetAllCoursesQuery, GetAllCoursesQueryVariables>;
export const GetCourseDocument = gql`
    query GetCourse($id: uuid!) {
  academic_course_by_pk(id: $id) {
    id
    name
    code
    description
    credit_hours
    semester
    course_type
    syllabus_url
    is_active
    department_id
  }
}
    `;

/**
 * __useGetCourseQuery__
 *
 * To run a query within a React component, call `useGetCourseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCourseQuery(baseOptions: Apollo.QueryHookOptions<GetCourseQuery, GetCourseQueryVariables> & ({ variables: GetCourseQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
      }
export function useGetCourseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
        }
// @ts-ignore
export function useGetCourseSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseQuery, GetCourseQueryVariables>;
export function useGetCourseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseQuery | undefined, GetCourseQueryVariables>;
export function useGetCourseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCourseQuery, GetCourseQueryVariables>(GetCourseDocument, options);
        }
export type GetCourseQueryHookResult = ReturnType<typeof useGetCourseQuery>;
export type GetCourseLazyQueryHookResult = ReturnType<typeof useGetCourseLazyQuery>;
export type GetCourseSuspenseQueryHookResult = ReturnType<typeof useGetCourseSuspenseQuery>;
export type GetCourseQueryResult = Apollo.QueryResult<GetCourseQuery, GetCourseQueryVariables>;
export const CreateCourseDocument = gql`
    mutation CreateCourse($object: academic_course_insert_input!) {
  insert_academic_course_one(object: $object) {
    id
    name
  }
}
    `;
export type CreateCourseMutationFn = Apollo.MutationFunction<CreateCourseMutation, CreateCourseMutationVariables>;

/**
 * __useCreateCourseMutation__
 *
 * To run a mutation, you first call `useCreateCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCourseMutation, { data, loading, error }] = useCreateCourseMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateCourseMutation(baseOptions?: Apollo.MutationHookOptions<CreateCourseMutation, CreateCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCourseMutation, CreateCourseMutationVariables>(CreateCourseDocument, options);
      }
export type CreateCourseMutationHookResult = ReturnType<typeof useCreateCourseMutation>;
export type CreateCourseMutationResult = Apollo.MutationResult<CreateCourseMutation>;
export type CreateCourseMutationOptions = Apollo.BaseMutationOptions<CreateCourseMutation, CreateCourseMutationVariables>;
export const UpdateCourseDocument = gql`
    mutation UpdateCourse($id: uuid!, $set: academic_course_set_input!) {
  update_academic_course_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
  }
}
    `;
export type UpdateCourseMutationFn = Apollo.MutationFunction<UpdateCourseMutation, UpdateCourseMutationVariables>;

/**
 * __useUpdateCourseMutation__
 *
 * To run a mutation, you first call `useUpdateCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseMutation, { data, loading, error }] = useUpdateCourseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateCourseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseMutation, UpdateCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseMutation, UpdateCourseMutationVariables>(UpdateCourseDocument, options);
      }
export type UpdateCourseMutationHookResult = ReturnType<typeof useUpdateCourseMutation>;
export type UpdateCourseMutationResult = Apollo.MutationResult<UpdateCourseMutation>;
export type UpdateCourseMutationOptions = Apollo.BaseMutationOptions<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const DeleteCourseDocument = gql`
    mutation DeleteCourse($id: uuid!) {
  delete_academic_course_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteCourseMutationFn = Apollo.MutationFunction<DeleteCourseMutation, DeleteCourseMutationVariables>;

/**
 * __useDeleteCourseMutation__
 *
 * To run a mutation, you first call `useDeleteCourseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCourseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCourseMutation, { data, loading, error }] = useDeleteCourseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCourseMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCourseMutation, DeleteCourseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCourseMutation, DeleteCourseMutationVariables>(DeleteCourseDocument, options);
      }
export type DeleteCourseMutationHookResult = ReturnType<typeof useDeleteCourseMutation>;
export type DeleteCourseMutationResult = Apollo.MutationResult<DeleteCourseMutation>;
export type DeleteCourseMutationOptions = Apollo.BaseMutationOptions<DeleteCourseMutation, DeleteCourseMutationVariables>;
export const GetCourseOfferingsBySectionDocument = gql`
    query GetCourseOfferingsBySection($sectionId: uuid!) {
  academic_course_offering(
    where: {section_id: {_eq: $sectionId}, is_active: {_eq: true}}
    order_by: {created_at: desc}
  ) {
    id
    course_id
    batch_id
    section_id
    teacher_id
    academic_year
    is_active
    created_at
    updated_at
    course {
      id
      name
      code
      credit_hours
      course_type
      department {
        name
        code
      }
    }
    faculty {
      id
      first_name
      last_name
    }
    section {
      id
      name
      batch {
        id
        name
        year
      }
    }
  }
}
    `;

/**
 * __useGetCourseOfferingsBySectionQuery__
 *
 * To run a query within a React component, call `useGetCourseOfferingsBySectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseOfferingsBySectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseOfferingsBySectionQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useGetCourseOfferingsBySectionQuery(baseOptions: Apollo.QueryHookOptions<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables> & ({ variables: GetCourseOfferingsBySectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>(GetCourseOfferingsBySectionDocument, options);
      }
export function useGetCourseOfferingsBySectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>(GetCourseOfferingsBySectionDocument, options);
        }
// @ts-ignore
export function useGetCourseOfferingsBySectionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>;
export function useGetCourseOfferingsBySectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseOfferingsBySectionQuery | undefined, GetCourseOfferingsBySectionQueryVariables>;
export function useGetCourseOfferingsBySectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>(GetCourseOfferingsBySectionDocument, options);
        }
export type GetCourseOfferingsBySectionQueryHookResult = ReturnType<typeof useGetCourseOfferingsBySectionQuery>;
export type GetCourseOfferingsBySectionLazyQueryHookResult = ReturnType<typeof useGetCourseOfferingsBySectionLazyQuery>;
export type GetCourseOfferingsBySectionSuspenseQueryHookResult = ReturnType<typeof useGetCourseOfferingsBySectionSuspenseQuery>;
export type GetCourseOfferingsBySectionQueryResult = Apollo.QueryResult<GetCourseOfferingsBySectionQuery, GetCourseOfferingsBySectionQueryVariables>;
export const GetCourseOfferingDocument = gql`
    query GetCourseOffering($id: uuid!) {
  academic_course_offering_by_pk(id: $id) {
    id
    course_id
    batch_id
    section_id
    teacher_id
    academic_year
    is_active
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetCourseOfferingQuery__
 *
 * To run a query within a React component, call `useGetCourseOfferingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseOfferingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseOfferingQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCourseOfferingQuery(baseOptions: Apollo.QueryHookOptions<GetCourseOfferingQuery, GetCourseOfferingQueryVariables> & ({ variables: GetCourseOfferingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>(GetCourseOfferingDocument, options);
      }
export function useGetCourseOfferingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>(GetCourseOfferingDocument, options);
        }
// @ts-ignore
export function useGetCourseOfferingSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>;
export function useGetCourseOfferingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>): Apollo.UseSuspenseQueryResult<GetCourseOfferingQuery | undefined, GetCourseOfferingQueryVariables>;
export function useGetCourseOfferingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>(GetCourseOfferingDocument, options);
        }
export type GetCourseOfferingQueryHookResult = ReturnType<typeof useGetCourseOfferingQuery>;
export type GetCourseOfferingLazyQueryHookResult = ReturnType<typeof useGetCourseOfferingLazyQuery>;
export type GetCourseOfferingSuspenseQueryHookResult = ReturnType<typeof useGetCourseOfferingSuspenseQuery>;
export type GetCourseOfferingQueryResult = Apollo.QueryResult<GetCourseOfferingQuery, GetCourseOfferingQueryVariables>;
export const CreateCourseOfferingDocument = gql`
    mutation CreateCourseOffering($object: academic_course_offering_insert_input!) {
  insert_academic_course_offering_one(object: $object) {
    id
    course_id
    teacher_id
    academic_year
  }
}
    `;
export type CreateCourseOfferingMutationFn = Apollo.MutationFunction<CreateCourseOfferingMutation, CreateCourseOfferingMutationVariables>;

/**
 * __useCreateCourseOfferingMutation__
 *
 * To run a mutation, you first call `useCreateCourseOfferingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCourseOfferingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCourseOfferingMutation, { data, loading, error }] = useCreateCourseOfferingMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateCourseOfferingMutation(baseOptions?: Apollo.MutationHookOptions<CreateCourseOfferingMutation, CreateCourseOfferingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCourseOfferingMutation, CreateCourseOfferingMutationVariables>(CreateCourseOfferingDocument, options);
      }
export type CreateCourseOfferingMutationHookResult = ReturnType<typeof useCreateCourseOfferingMutation>;
export type CreateCourseOfferingMutationResult = Apollo.MutationResult<CreateCourseOfferingMutation>;
export type CreateCourseOfferingMutationOptions = Apollo.BaseMutationOptions<CreateCourseOfferingMutation, CreateCourseOfferingMutationVariables>;
export const UpdateCourseOfferingDocument = gql`
    mutation UpdateCourseOffering($id: uuid!, $set: academic_course_offering_set_input!) {
  update_academic_course_offering_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    course_id
    teacher_id
    academic_year
  }
}
    `;
export type UpdateCourseOfferingMutationFn = Apollo.MutationFunction<UpdateCourseOfferingMutation, UpdateCourseOfferingMutationVariables>;

/**
 * __useUpdateCourseOfferingMutation__
 *
 * To run a mutation, you first call `useUpdateCourseOfferingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCourseOfferingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCourseOfferingMutation, { data, loading, error }] = useUpdateCourseOfferingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateCourseOfferingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCourseOfferingMutation, UpdateCourseOfferingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCourseOfferingMutation, UpdateCourseOfferingMutationVariables>(UpdateCourseOfferingDocument, options);
      }
export type UpdateCourseOfferingMutationHookResult = ReturnType<typeof useUpdateCourseOfferingMutation>;
export type UpdateCourseOfferingMutationResult = Apollo.MutationResult<UpdateCourseOfferingMutation>;
export type UpdateCourseOfferingMutationOptions = Apollo.BaseMutationOptions<UpdateCourseOfferingMutation, UpdateCourseOfferingMutationVariables>;
export const DeleteCourseOfferingDocument = gql`
    mutation DeleteCourseOffering($id: uuid!) {
  delete_academic_course_offering_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteCourseOfferingMutationFn = Apollo.MutationFunction<DeleteCourseOfferingMutation, DeleteCourseOfferingMutationVariables>;

/**
 * __useDeleteCourseOfferingMutation__
 *
 * To run a mutation, you first call `useDeleteCourseOfferingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCourseOfferingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCourseOfferingMutation, { data, loading, error }] = useDeleteCourseOfferingMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCourseOfferingMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCourseOfferingMutation, DeleteCourseOfferingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCourseOfferingMutation, DeleteCourseOfferingMutationVariables>(DeleteCourseOfferingDocument, options);
      }
export type DeleteCourseOfferingMutationHookResult = ReturnType<typeof useDeleteCourseOfferingMutation>;
export type DeleteCourseOfferingMutationResult = Apollo.MutationResult<DeleteCourseOfferingMutation>;
export type DeleteCourseOfferingMutationOptions = Apollo.BaseMutationOptions<DeleteCourseOfferingMutation, DeleteCourseOfferingMutationVariables>;
export const GetRoutinesBySectionDocument = gql`
    query GetRoutinesBySection($sectionId: uuid!) {
  event_routine(
    where: {course_offering: {section_id: {_eq: $sectionId}}, is_active: {_eq: true}}
    order_by: {day_of_week: asc, start_time: asc}
  ) {
    id
    name
    course_offering_id
    day_of_week
    start_time
    end_time
    event_type
    effective_from
    effective_to
    is_active
    metadata
    created_at
    updated_at
    course_offering {
      id
      academic_year
      course {
        id
        name
        code
        credit_hours
      }
      faculty {
        id
        first_name
        last_name
        user {
          email
        }
      }
    }
  }
}
    `;

/**
 * __useGetRoutinesBySectionQuery__
 *
 * To run a query within a React component, call `useGetRoutinesBySectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoutinesBySectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoutinesBySectionQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useGetRoutinesBySectionQuery(baseOptions: Apollo.QueryHookOptions<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables> & ({ variables: GetRoutinesBySectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>(GetRoutinesBySectionDocument, options);
      }
export function useGetRoutinesBySectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>(GetRoutinesBySectionDocument, options);
        }
// @ts-ignore
export function useGetRoutinesBySectionSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>;
export function useGetRoutinesBySectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>): Apollo.UseSuspenseQueryResult<GetRoutinesBySectionQuery | undefined, GetRoutinesBySectionQueryVariables>;
export function useGetRoutinesBySectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>(GetRoutinesBySectionDocument, options);
        }
export type GetRoutinesBySectionQueryHookResult = ReturnType<typeof useGetRoutinesBySectionQuery>;
export type GetRoutinesBySectionLazyQueryHookResult = ReturnType<typeof useGetRoutinesBySectionLazyQuery>;
export type GetRoutinesBySectionSuspenseQueryHookResult = ReturnType<typeof useGetRoutinesBySectionSuspenseQuery>;
export type GetRoutinesBySectionQueryResult = Apollo.QueryResult<GetRoutinesBySectionQuery, GetRoutinesBySectionQueryVariables>;
export const GetRoutineDocument = gql`
    query GetRoutine($id: uuid!) {
  event_routine_by_pk(id: $id) {
    id
    name
    course_offering_id
    day_of_week
    start_time
    end_time
    event_type
    effective_from
    effective_to
    is_active
    metadata
    created_at
    updated_at
  }
}
    `;

/**
 * __useGetRoutineQuery__
 *
 * To run a query within a React component, call `useGetRoutineQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoutineQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoutineQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRoutineQuery(baseOptions: Apollo.QueryHookOptions<GetRoutineQuery, GetRoutineQueryVariables> & ({ variables: GetRoutineQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoutineQuery, GetRoutineQueryVariables>(GetRoutineDocument, options);
      }
export function useGetRoutineLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoutineQuery, GetRoutineQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoutineQuery, GetRoutineQueryVariables>(GetRoutineDocument, options);
        }
// @ts-ignore
export function useGetRoutineSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetRoutineQuery, GetRoutineQueryVariables>): Apollo.UseSuspenseQueryResult<GetRoutineQuery, GetRoutineQueryVariables>;
export function useGetRoutineSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRoutineQuery, GetRoutineQueryVariables>): Apollo.UseSuspenseQueryResult<GetRoutineQuery | undefined, GetRoutineQueryVariables>;
export function useGetRoutineSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRoutineQuery, GetRoutineQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRoutineQuery, GetRoutineQueryVariables>(GetRoutineDocument, options);
        }
export type GetRoutineQueryHookResult = ReturnType<typeof useGetRoutineQuery>;
export type GetRoutineLazyQueryHookResult = ReturnType<typeof useGetRoutineLazyQuery>;
export type GetRoutineSuspenseQueryHookResult = ReturnType<typeof useGetRoutineSuspenseQuery>;
export type GetRoutineQueryResult = Apollo.QueryResult<GetRoutineQuery, GetRoutineQueryVariables>;
export const CreateRoutineDocument = gql`
    mutation CreateRoutine($object: event_routine_insert_input!) {
  insert_event_routine_one(object: $object) {
    id
    name
    day_of_week
    start_time
    end_time
  }
}
    `;
export type CreateRoutineMutationFn = Apollo.MutationFunction<CreateRoutineMutation, CreateRoutineMutationVariables>;

/**
 * __useCreateRoutineMutation__
 *
 * To run a mutation, you first call `useCreateRoutineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoutineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoutineMutation, { data, loading, error }] = useCreateRoutineMutation({
 *   variables: {
 *      object: // value for 'object'
 *   },
 * });
 */
export function useCreateRoutineMutation(baseOptions?: Apollo.MutationHookOptions<CreateRoutineMutation, CreateRoutineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRoutineMutation, CreateRoutineMutationVariables>(CreateRoutineDocument, options);
      }
export type CreateRoutineMutationHookResult = ReturnType<typeof useCreateRoutineMutation>;
export type CreateRoutineMutationResult = Apollo.MutationResult<CreateRoutineMutation>;
export type CreateRoutineMutationOptions = Apollo.BaseMutationOptions<CreateRoutineMutation, CreateRoutineMutationVariables>;
export const UpdateRoutineDocument = gql`
    mutation UpdateRoutine($id: uuid!, $set: event_routine_set_input!) {
  update_event_routine_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
    day_of_week
    start_time
    end_time
  }
}
    `;
export type UpdateRoutineMutationFn = Apollo.MutationFunction<UpdateRoutineMutation, UpdateRoutineMutationVariables>;

/**
 * __useUpdateRoutineMutation__
 *
 * To run a mutation, you first call `useUpdateRoutineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRoutineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRoutineMutation, { data, loading, error }] = useUpdateRoutineMutation({
 *   variables: {
 *      id: // value for 'id'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateRoutineMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRoutineMutation, UpdateRoutineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRoutineMutation, UpdateRoutineMutationVariables>(UpdateRoutineDocument, options);
      }
export type UpdateRoutineMutationHookResult = ReturnType<typeof useUpdateRoutineMutation>;
export type UpdateRoutineMutationResult = Apollo.MutationResult<UpdateRoutineMutation>;
export type UpdateRoutineMutationOptions = Apollo.BaseMutationOptions<UpdateRoutineMutation, UpdateRoutineMutationVariables>;
export const DeleteRoutineDocument = gql`
    mutation DeleteRoutine($id: uuid!) {
  delete_event_routine_by_pk(id: $id) {
    id
  }
}
    `;
export type DeleteRoutineMutationFn = Apollo.MutationFunction<DeleteRoutineMutation, DeleteRoutineMutationVariables>;

/**
 * __useDeleteRoutineMutation__
 *
 * To run a mutation, you first call `useDeleteRoutineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRoutineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRoutineMutation, { data, loading, error }] = useDeleteRoutineMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRoutineMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRoutineMutation, DeleteRoutineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRoutineMutation, DeleteRoutineMutationVariables>(DeleteRoutineDocument, options);
      }
export type DeleteRoutineMutationHookResult = ReturnType<typeof useDeleteRoutineMutation>;
export type DeleteRoutineMutationResult = Apollo.MutationResult<DeleteRoutineMutation>;
export type DeleteRoutineMutationOptions = Apollo.BaseMutationOptions<DeleteRoutineMutation, DeleteRoutineMutationVariables>;
export const CheckRoutineConflictsDocument = gql`
    query CheckRoutineConflicts($sectionId: uuid!, $dayOfWeek: Int!, $startTime: timetz!, $endTime: timetz!, $excludeRoutineId: uuid) {
  section_conflicts: event_routine(
    where: {course_offering: {section_id: {_eq: $sectionId}}, day_of_week: {_eq: $dayOfWeek}, is_active: {_eq: true}, id: {_neq: $excludeRoutineId}, _or: [{_and: [{start_time: {_lte: $startTime}}, {end_time: {_gt: $startTime}}]}, {_and: [{start_time: {_lt: $endTime}}, {end_time: {_gte: $endTime}}]}, {_and: [{start_time: {_gte: $startTime}}, {end_time: {_lte: $endTime}}]}]}
  ) {
    id
    name
    start_time
    end_time
    course_offering {
      course {
        code
        name
      }
    }
  }
}
    `;

/**
 * __useCheckRoutineConflictsQuery__
 *
 * To run a query within a React component, call `useCheckRoutineConflictsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckRoutineConflictsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckRoutineConflictsQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *      dayOfWeek: // value for 'dayOfWeek'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *      excludeRoutineId: // value for 'excludeRoutineId'
 *   },
 * });
 */
export function useCheckRoutineConflictsQuery(baseOptions: Apollo.QueryHookOptions<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables> & ({ variables: CheckRoutineConflictsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>(CheckRoutineConflictsDocument, options);
      }
export function useCheckRoutineConflictsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>(CheckRoutineConflictsDocument, options);
        }
// @ts-ignore
export function useCheckRoutineConflictsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>): Apollo.UseSuspenseQueryResult<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>;
export function useCheckRoutineConflictsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>): Apollo.UseSuspenseQueryResult<CheckRoutineConflictsQuery | undefined, CheckRoutineConflictsQueryVariables>;
export function useCheckRoutineConflictsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>(CheckRoutineConflictsDocument, options);
        }
export type CheckRoutineConflictsQueryHookResult = ReturnType<typeof useCheckRoutineConflictsQuery>;
export type CheckRoutineConflictsLazyQueryHookResult = ReturnType<typeof useCheckRoutineConflictsLazyQuery>;
export type CheckRoutineConflictsSuspenseQueryHookResult = ReturnType<typeof useCheckRoutineConflictsSuspenseQuery>;
export type CheckRoutineConflictsQueryResult = Apollo.QueryResult<CheckRoutineConflictsQuery, CheckRoutineConflictsQueryVariables>;
export const UpsertDeviceTokenDocument = gql`
    mutation UpsertDeviceToken($user_id: uuid!, $device_id: String!, $provider: String!, $token: String!, $platform: String!) {
  insert_user_device_one(
    object: {user_id: $user_id, device_id: $device_id, provider: $provider, token: $token, platform: $platform}
    on_conflict: {constraint: device_user_id_device_id_provider_key, update_columns: [token, last_used_at, is_active]}
  ) {
    id
    token
  }
}
    `;
export type UpsertDeviceTokenMutationFn = Apollo.MutationFunction<UpsertDeviceTokenMutation, UpsertDeviceTokenMutationVariables>;

/**
 * __useUpsertDeviceTokenMutation__
 *
 * To run a mutation, you first call `useUpsertDeviceTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertDeviceTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertDeviceTokenMutation, { data, loading, error }] = useUpsertDeviceTokenMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      device_id: // value for 'device_id'
 *      provider: // value for 'provider'
 *      token: // value for 'token'
 *      platform: // value for 'platform'
 *   },
 * });
 */
export function useUpsertDeviceTokenMutation(baseOptions?: Apollo.MutationHookOptions<UpsertDeviceTokenMutation, UpsertDeviceTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertDeviceTokenMutation, UpsertDeviceTokenMutationVariables>(UpsertDeviceTokenDocument, options);
      }
export type UpsertDeviceTokenMutationHookResult = ReturnType<typeof useUpsertDeviceTokenMutation>;
export type UpsertDeviceTokenMutationResult = Apollo.MutationResult<UpsertDeviceTokenMutation>;
export type UpsertDeviceTokenMutationOptions = Apollo.BaseMutationOptions<UpsertDeviceTokenMutation, UpsertDeviceTokenMutationVariables>;
export const DeactivateDeviceDocument = gql`
    mutation DeactivateDevice($user_id: uuid!, $device_id: String!, $provider: String!) {
  update_user_device(
    where: {user_id: {_eq: $user_id}, device_id: {_eq: $device_id}, provider: {_eq: $provider}}
    _set: {is_active: false}
  ) {
    affected_rows
  }
}
    `;
export type DeactivateDeviceMutationFn = Apollo.MutationFunction<DeactivateDeviceMutation, DeactivateDeviceMutationVariables>;

/**
 * __useDeactivateDeviceMutation__
 *
 * To run a mutation, you first call `useDeactivateDeviceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateDeviceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateDeviceMutation, { data, loading, error }] = useDeactivateDeviceMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      device_id: // value for 'device_id'
 *      provider: // value for 'provider'
 *   },
 * });
 */
export function useDeactivateDeviceMutation(baseOptions?: Apollo.MutationHookOptions<DeactivateDeviceMutation, DeactivateDeviceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeactivateDeviceMutation, DeactivateDeviceMutationVariables>(DeactivateDeviceDocument, options);
      }
export type DeactivateDeviceMutationHookResult = ReturnType<typeof useDeactivateDeviceMutation>;
export type DeactivateDeviceMutationResult = Apollo.MutationResult<DeactivateDeviceMutation>;
export type DeactivateDeviceMutationOptions = Apollo.BaseMutationOptions<DeactivateDeviceMutation, DeactivateDeviceMutationVariables>;