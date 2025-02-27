/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { capitalize, cloneDeep, toLower } from 'lodash';
import {
  AIRBYTE,
  AIRFLOW,
  AMAZON_S3,
  AMUNDSEN,
  ATHENA,
  ATLAS,
  AZURESQL,
  BIGQUERY,
  BIGTABLE,
  CLICKHOUSE,
  COMMON_UI_SCHEMA,
  COUCHBASE,
  CUSTOM_STORAGE_DEFAULT,
  DAGSTER,
  DASHBOARD_DEFAULT,
  DATABASE_DEFAULT,
  DATABRICK,
  DATALAKE,
  DBT,
  DEFAULT_SERVICE,
  DELTALAKE,
  DOMO,
  DORIS,
  DRUID,
  DYNAMODB,
  ELASTIC_SEARCH,
  FIVETRAN,
  FLINK,
  GLUE,
  GREENPLUM,
  HIVE,
  IBMDB2,
  ICEBERGE,
  IMPALA,
  KAFKA,
  KINESIS,
  LIGHT_DASH,
  LOGO,
  LOOKER,
  MARIADB,
  METABASE,
  MLFLOW,
  ML_MODEL_DEFAULT,
  MODE,
  MONGODB,
  MSSQL,
  MYSQL,
  NIFI,
  OPENLINEAGE,
  OPEN_SEARCH,
  ORACLE,
  PINOT,
  PIPELINE_DEFAULT,
  POSTGRES,
  POWERBI,
  PRESTO,
  QLIK_SENSE,
  QUICKSIGHT,
  REDASH,
  REDPANDA,
  REDSHIFT,
  SAGEMAKER,
  SALESFORCE,
  SAP_HANA,
  SAS,
  SCIKIT,
  SINGLESTORE,
  SNOWFLAKE,
  SPARK,
  SPLINE,
  SQLITE,
  SUPERSET,
  TABLEAU,
  TERADATA,
  TOPIC_DEFAULT,
  TRINO,
  UNITYCATALOG,
  VERTICA,
} from '../constants/Services.constant';
import { SearchSuggestions } from '../context/GlobalSearchProvider/GlobalSearchSuggestions/GlobalSearchSuggestions.interface';
import { ExplorePageTabs } from '../enums/Explore.enum';
import {
  DashboardServiceTypeSmallCaseType,
  DatabaseServiceTypeSmallCaseType,
  MessagingServiceTypeSmallCaseType,
  MetadataServiceTypeSmallCaseType,
  MlModelServiceTypeSmallCaseType,
  PipelineServiceTypeSmallCaseType,
  SearchServiceTypeSmallCaseType,
  StorageServiceTypeSmallCaseType,
} from '../enums/service.enum';
import { StorageServiceType } from '../generated/entity/data/container';
import { DashboardServiceType } from '../generated/entity/data/dashboard';
import { DatabaseServiceType } from '../generated/entity/data/database';
import { MlModelServiceType } from '../generated/entity/data/mlmodel';
import { PipelineServiceType } from '../generated/entity/data/pipeline';
import { SearchServiceType } from '../generated/entity/data/searchIndex';
import { MessagingServiceType } from '../generated/entity/data/topic';
import { MetadataServiceType } from '../generated/entity/services/metadataService';
import { SearchSourceAlias } from '../interface/search.interface';
import customConnection from '../jsons/connectionSchemas/connections/storage/customStorageConnection.json';
import s3Connection from '../jsons/connectionSchemas/connections/storage/s3Connection.json';
import { getDashboardConfig } from './DashboardServiceUtils';
import { getDatabaseConfig } from './DatabaseServiceUtils';
import { getMessagingConfig } from './MessagingServiceUtils';
import { getMetadataConfig } from './MetadataServiceUtils';
import { getMlmodelConfig } from './MlmodelServiceUtils';
import { getPipelineConfig } from './PipelineServiceUtils';
import { getSearchServiceConfig } from './SearchServiceUtils';
import { customServiceComparator } from './StringsUtils';

class ServiceUtilClassBase {
  unSupportedServices: string[] = [
    StorageServiceType.Adls,
    DatabaseServiceType.QueryLog,
    DatabaseServiceType.Dbt,
    StorageServiceType.Gcs,
    MetadataServiceType.Alation,
  ];

  DatabaseServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    DatabaseServiceTypeSmallCaseType
  >(DatabaseServiceType);

  MessagingServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    MessagingServiceTypeSmallCaseType
  >(MessagingServiceType);

  DashboardServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    DashboardServiceTypeSmallCaseType
  >(DashboardServiceType);

  PipelineServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    PipelineServiceTypeSmallCaseType
  >(PipelineServiceType);

  MlModelServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    MlModelServiceTypeSmallCaseType
  >(MlModelServiceType);

  MetadataServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    MetadataServiceTypeSmallCaseType
  >(MetadataServiceType);

  StorageServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    StorageServiceTypeSmallCaseType
  >(StorageServiceType);

  SearchServiceTypeSmallCase = this.convertEnumToLowerCase<
    { [k: string]: string },
    SearchServiceTypeSmallCaseType
  >(SearchServiceType);

  protected updateUnsupportedServices(types: string[]) {
    this.unSupportedServices = types;
  }

  filterUnsupportedServiceType(types: string[]) {
    return types.filter((type) => !this.unSupportedServices.includes(type));
  }

  public getSupportedServiceFromList() {
    return {
      databaseServices: this.filterUnsupportedServiceType(
        Object.values(DatabaseServiceType) as string[]
      ).sort(customServiceComparator),
      messagingServices: this.filterUnsupportedServiceType(
        Object.values(MessagingServiceType) as string[]
      ).sort(customServiceComparator),
      dashboardServices: this.filterUnsupportedServiceType(
        Object.values(DashboardServiceType) as string[]
      ).sort(customServiceComparator),
      pipelineServices: this.filterUnsupportedServiceType(
        Object.values(PipelineServiceType) as string[]
      ).sort(customServiceComparator),
      mlmodelServices: this.filterUnsupportedServiceType(
        Object.values(MlModelServiceType) as string[]
      ).sort(customServiceComparator),
      metadataServices: this.filterUnsupportedServiceType(
        Object.values(MetadataServiceType) as string[]
      ).sort(customServiceComparator),
      storageServices: this.filterUnsupportedServiceType(
        Object.values(StorageServiceType) as string[]
      ).sort(customServiceComparator),
      searchServices: this.filterUnsupportedServiceType(
        Object.values(SearchServiceType) as string[]
      ).sort(customServiceComparator),
    };
  }

  public getServiceTypeLogo(
    searchSource: SearchSuggestions[number] | SearchSourceAlias
  ) {
    const serviceTypes = this.getSupportedServiceFromList();
    const type = searchSource?.serviceType ?? '';
    switch (toLower(type)) {
      case this.DatabaseServiceTypeSmallCase.Mysql:
        return MYSQL;

      case this.DatabaseServiceTypeSmallCase.Redshift:
        return REDSHIFT;

      case this.DatabaseServiceTypeSmallCase.BigQuery:
        return BIGQUERY;

      case this.DatabaseServiceTypeSmallCase.BigTable:
        return BIGTABLE;

      case this.DatabaseServiceTypeSmallCase.Hive:
        return HIVE;

      case this.DatabaseServiceTypeSmallCase.Impala:
        return IMPALA;

      case this.DatabaseServiceTypeSmallCase.Postgres:
        return POSTGRES;

      case this.DatabaseServiceTypeSmallCase.Oracle:
        return ORACLE;

      case this.DatabaseServiceTypeSmallCase.Snowflake:
        return SNOWFLAKE;

      case this.DatabaseServiceTypeSmallCase.Mssql:
        return MSSQL;

      case this.DatabaseServiceTypeSmallCase.Athena:
        return ATHENA;

      case this.DatabaseServiceTypeSmallCase.Presto:
        return PRESTO;

      case this.DatabaseServiceTypeSmallCase.Trino:
        return TRINO;

      case this.DatabaseServiceTypeSmallCase.Glue:
        return GLUE;

      case this.DatabaseServiceTypeSmallCase.DomoDatabase:
        return DOMO;

      case this.DatabaseServiceTypeSmallCase.MariaDB:
        return MARIADB;

      case this.DatabaseServiceTypeSmallCase.Vertica:
        return VERTICA;

      case this.DatabaseServiceTypeSmallCase.AzureSQL:
        return AZURESQL;

      case this.DatabaseServiceTypeSmallCase.Clickhouse:
        return CLICKHOUSE;

      case this.DatabaseServiceTypeSmallCase.Databricks:
        return DATABRICK;

      case this.DatabaseServiceTypeSmallCase.UnityCatalog:
        return UNITYCATALOG;

      case this.DatabaseServiceTypeSmallCase.Db2:
        return IBMDB2;

      case this.DatabaseServiceTypeSmallCase.Doris:
        return DORIS;

      case this.DatabaseServiceTypeSmallCase.Druid:
        return DRUID;

      case this.DatabaseServiceTypeSmallCase.DynamoDB:
        return DYNAMODB;

      case this.DatabaseServiceTypeSmallCase.SingleStore:
        return SINGLESTORE;

      case this.DatabaseServiceTypeSmallCase.SQLite:
        return SQLITE;

      case this.DatabaseServiceTypeSmallCase.Salesforce:
        return SALESFORCE;

      case this.DatabaseServiceTypeSmallCase.SapHana:
        return SAP_HANA;

      case this.DatabaseServiceTypeSmallCase.DeltaLake:
        return DELTALAKE;

      case this.DatabaseServiceTypeSmallCase.PinotDB:
        return PINOT;

      case this.DatabaseServiceTypeSmallCase.Datalake:
        return DATALAKE;

      case this.DatabaseServiceTypeSmallCase.MongoDB:
        return MONGODB;

      case this.DatabaseServiceTypeSmallCase.SAS:
        return SAS;

      case this.DatabaseServiceTypeSmallCase.Couchbase:
        return COUCHBASE;

      case this.DatabaseServiceTypeSmallCase.Greenplum:
        return GREENPLUM;

      case this.DatabaseServiceTypeSmallCase.Iceberg:
        return ICEBERGE;

      case this.DatabaseServiceTypeSmallCase.Teradata:
        return TERADATA;

      case this.MessagingServiceTypeSmallCase.Kafka:
        return KAFKA;

      case this.MessagingServiceTypeSmallCase.Redpanda:
        return REDPANDA;

      case this.MessagingServiceTypeSmallCase.Kinesis:
        return KINESIS;

      case this.DashboardServiceTypeSmallCase.Superset:
        return SUPERSET;

      case this.DashboardServiceTypeSmallCase.Looker:
        return LOOKER;

      case this.DashboardServiceTypeSmallCase.Tableau:
        return TABLEAU;

      case this.DashboardServiceTypeSmallCase.Redash:
        return REDASH;

      case this.DashboardServiceTypeSmallCase.Metabase:
        return METABASE;

      case this.DashboardServiceTypeSmallCase.PowerBI:
        return POWERBI;

      case this.DashboardServiceTypeSmallCase.QuickSight:
        return QUICKSIGHT;

      case this.DashboardServiceTypeSmallCase.DomoDashboard:
        return DOMO;

      case this.DashboardServiceTypeSmallCase.Mode:
        return MODE;

      case this.DashboardServiceTypeSmallCase.QlikSense:
        return QLIK_SENSE;

      case this.DashboardServiceTypeSmallCase.QlikCloud:
        return QLIK_SENSE;

      case this.DashboardServiceTypeSmallCase.Lightdash:
        return LIGHT_DASH;

      case this.PipelineServiceTypeSmallCase.Airflow:
        return AIRFLOW;

      case this.PipelineServiceTypeSmallCase.Airbyte:
        return AIRBYTE;

      case this.PipelineServiceTypeSmallCase.Dagster:
        return DAGSTER;

      case this.PipelineServiceTypeSmallCase.Fivetran:
        return FIVETRAN;

      case this.PipelineServiceTypeSmallCase.DBTCloud:
        return DBT;

      case this.PipelineServiceTypeSmallCase.GluePipeline:
        return GLUE;

      case this.PipelineServiceTypeSmallCase.KafkaConnect:
        return KAFKA;

      case this.PipelineServiceTypeSmallCase.Spark:
        return SPARK;

      case this.PipelineServiceTypeSmallCase.Spline:
        return SPLINE;

      case this.PipelineServiceTypeSmallCase.Nifi:
        return NIFI;

      case this.PipelineServiceTypeSmallCase.DomoPipeline:
        return DOMO;

      case this.PipelineServiceTypeSmallCase.DatabricksPipeline:
        return DATABRICK;

      case this.PipelineServiceTypeSmallCase.OpenLineage:
        return OPENLINEAGE;

      case this.PipelineServiceTypeSmallCase.Flink:
        return FLINK;

      case this.MlModelServiceTypeSmallCase.Mlflow:
        return MLFLOW;

      case this.MlModelServiceTypeSmallCase.Sklearn:
        return SCIKIT;
      case this.MlModelServiceTypeSmallCase.SageMaker:
        return SAGEMAKER;

      case this.MetadataServiceTypeSmallCase.Amundsen:
        return AMUNDSEN;

      case this.MetadataServiceTypeSmallCase.Atlas:
        return ATLAS;

      case this.MetadataServiceTypeSmallCase.OpenMetadata:
        return LOGO;

      case this.StorageServiceTypeSmallCase.S3:
        return AMAZON_S3;

      case this.SearchServiceTypeSmallCase.ElasticSearch:
        return ELASTIC_SEARCH;

      case this.SearchServiceTypeSmallCase.OpenSearch:
        return OPEN_SEARCH;

      default: {
        let logo;
        if (serviceTypes.messagingServices.includes(type)) {
          logo = TOPIC_DEFAULT;
        } else if (serviceTypes.dashboardServices.includes(type)) {
          logo = DASHBOARD_DEFAULT;
        } else if (serviceTypes.pipelineServices.includes(type)) {
          logo = PIPELINE_DEFAULT;
        } else if (serviceTypes.databaseServices.includes(type)) {
          logo = DATABASE_DEFAULT;
        } else if (serviceTypes.mlmodelServices.includes(type)) {
          logo = ML_MODEL_DEFAULT;
        } else if (serviceTypes.storageServices.includes(type)) {
          logo = CUSTOM_STORAGE_DEFAULT;
        } else {
          logo = DEFAULT_SERVICE;
        }

        return logo;
      }
    }
  }

  public getDataAssetsService(serviceType: string): ExplorePageTabs {
    const database = this.DatabaseServiceTypeSmallCase;
    const messaging = this.MessagingServiceTypeSmallCase;
    const dashboard = this.DashboardServiceTypeSmallCase;
    const pipeline = this.PipelineServiceTypeSmallCase;
    const mlmodel = this.MlModelServiceTypeSmallCase;
    const storage = this.StorageServiceTypeSmallCase;
    const search = this.SearchServiceTypeSmallCase;

    switch (true) {
      case Object.values(database).includes(
        serviceType as typeof database[keyof typeof database]
      ):
        return ExplorePageTabs.TABLES;
      case Object.values(messaging).includes(
        serviceType as typeof messaging[keyof typeof messaging]
      ):
        return ExplorePageTabs.TOPICS;
      case Object.values(dashboard).includes(
        serviceType as typeof dashboard[keyof typeof dashboard]
      ):
        return ExplorePageTabs.DASHBOARDS;
      case Object.values(mlmodel).includes(
        serviceType as typeof mlmodel[keyof typeof mlmodel]
      ):
        return ExplorePageTabs.MLMODELS;
      case Object.values(pipeline).includes(
        serviceType as typeof pipeline[keyof typeof pipeline]
      ):
        return ExplorePageTabs.PIPELINES;
      case Object.values(storage).includes(
        serviceType as typeof storage[keyof typeof storage]
      ):
        return ExplorePageTabs.CONTAINERS;
      case Object.values(search).includes(
        serviceType as typeof search[keyof typeof search]
      ):
        return ExplorePageTabs.SEARCH_INDEX;

      default:
        return ExplorePageTabs.TABLES;
    }
  }

  public getServiceName = (serviceType: string) => {
    switch (serviceType) {
      case this.DatabaseServiceTypeSmallCase.CustomDatabase:
        return 'Custom Database';
      case this.DatabaseServiceTypeSmallCase.AzureSQL:
        return 'AzureSQL';
      case this.DatabaseServiceTypeSmallCase.BigQuery:
        return 'BigQuery';
      case this.DatabaseServiceTypeSmallCase.BigTable:
        return 'BigTable';
      case this.DatabaseServiceTypeSmallCase.DeltaLake:
        return 'DeltaLake';
      case this.DatabaseServiceTypeSmallCase.DomoDatabase:
        return 'DomoDatabase';
      case this.DatabaseServiceTypeSmallCase.DynamoDB:
        return 'DynamoDB';
      case this.DatabaseServiceTypeSmallCase.MariaDB:
        return 'MariaDB';
      case this.DatabaseServiceTypeSmallCase.MongoDB:
        return 'MongoDB';
      case this.DatabaseServiceTypeSmallCase.PinotDB:
        return 'pinotdb';
      case this.DatabaseServiceTypeSmallCase.SapHana:
        return 'SapHana';
      case this.DatabaseServiceTypeSmallCase.SAS:
        return 'SAS';
      case this.DatabaseServiceTypeSmallCase.SingleStore:
        return 'SingleStore';
      case this.DatabaseServiceTypeSmallCase.SQLite:
        return 'SQlite';
      case this.DatabaseServiceTypeSmallCase.UnityCatalog:
        return 'UnityCatalog';
      case this.MessagingServiceTypeSmallCase.CustomMessaging:
        return 'Custom Messaging';
      case this.DashboardServiceTypeSmallCase.DomoDashboard:
        return 'DomoDashboard';
      case this.DashboardServiceTypeSmallCase.PowerBI:
        return 'PowerBI';
      case this.DashboardServiceTypeSmallCase.QlikCloud:
        return 'QlikCloud';
      case this.DashboardServiceTypeSmallCase.QlikSense:
        return 'QlikSense';
      case this.DashboardServiceTypeSmallCase.QuickSight:
        return 'QuickSight';
      case this.DashboardServiceTypeSmallCase.CustomDashboard:
        return 'Custom Dashboard';
      case this.PipelineServiceTypeSmallCase.DatabricksPipeline:
        return 'DatabricksPipeline';
      case this.PipelineServiceTypeSmallCase.DBTCloud:
        return 'DBTCloud';
      case this.PipelineServiceTypeSmallCase.DomoPipeline:
        return 'DomoPipeline';
      case this.PipelineServiceTypeSmallCase.GluePipeline:
        return 'Glue Pipeline';
      case this.PipelineServiceTypeSmallCase.KafkaConnect:
        return 'KafkaConnect';
      case this.PipelineServiceTypeSmallCase.OpenLineage:
        return 'OpenLineage';
      case this.PipelineServiceTypeSmallCase.CustomPipeline:
        return 'Custom Pipeline';
      case this.MlModelServiceTypeSmallCase.SageMaker:
        return 'SageMaker';
      case this.MlModelServiceTypeSmallCase.CustomMlModel:
        return 'Custom Ml Model';
      case this.StorageServiceTypeSmallCase.CustomStorage:
        return 'Custom Storage';
      case this.SearchServiceTypeSmallCase.ElasticSearch:
        return 'ElasticSearch';
      case this.SearchServiceTypeSmallCase.CustomSearch:
        return 'Custom Search';

      default:
        return capitalize(serviceType);
    }
  };

  public getStorageServiceConfig(type: StorageServiceType) {
    let schema = {};
    const uiSchema = { ...COMMON_UI_SCHEMA };
    switch (type) {
      case StorageServiceType.S3: {
        schema = s3Connection;

        break;
      }
      case StorageServiceType.CustomStorage: {
        schema = customConnection;

        break;
      }
    }

    return cloneDeep({ schema, uiSchema });
  }

  public getPipelineServiceConfig(type: PipelineServiceType) {
    return getPipelineConfig(type);
  }

  public getDatabaseServiceConfig(type: DatabaseServiceType) {
    return getDatabaseConfig(type);
  }

  public getDashboardServiceConfig(type: DashboardServiceType) {
    return getDashboardConfig(type);
  }

  public getMessagingServiceConfig(type: MessagingServiceType) {
    return getMessagingConfig(type);
  }

  public getMlModelServiceConfig(type: MlModelServiceType) {
    return getMlmodelConfig(type);
  }

  public getSearchServiceConfig(type: SearchServiceType) {
    return getSearchServiceConfig(type);
  }

  public getMetadataServiceConfig(type: MetadataServiceType) {
    return getMetadataConfig(type);
  }

  /**
   * @param originalEnum will take the enum that should be converted
   * @returns object with lowercase value
   */
  public convertEnumToLowerCase<T extends { [k: string]: string }, U>(
    originalEnum: T
  ): U {
    return Object.fromEntries(
      Object.entries(originalEnum).map(([key, value]) => [
        key,
        value.toLowerCase(),
      ])
    ) as unknown as U;
  }
}

const serviceUtilClassBase = new ServiceUtilClassBase();

export default serviceUtilClassBase;
export { ServiceUtilClassBase };
