/*
 *  Copyright 2022 Collate.
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

import { Col, Row, Typography } from 'antd';
import { AxiosError } from 'axios';
import { compare } from 'fast-json-patch';
import { camelCase, isEmpty, isUndefined } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  DEPLOYED_PROGRESS_VAL,
  INGESTION_PROGRESS_END_VAL,
} from '../../../constants/constants';
import { useLimitStore } from '../../../context/LimitsProvider/useLimitsStore';
import { FormSubmitType } from '../../../enums/form.enum';
import { IngestionActionMessage } from '../../../enums/ingestion.enum';
import {
  ConfigType,
  CreateIngestionPipeline,
  PipelineType,
} from '../../../generated/api/services/ingestionPipelines/createIngestionPipeline';
import {
  IngestionPipeline,
  LogLevels,
} from '../../../generated/entity/services/ingestionPipelines/ingestionPipeline';
import { useFqn } from '../../../hooks/useFqn';
import {
  addIngestionPipeline,
  deployIngestionPipelineById,
  updateIngestionPipeline,
} from '../../../rest/ingestionPipelineAPI';
import {
  getIngestionFrequency,
  getNameFromFQN,
  replaceAllSpacialCharWith_,
  Transi18next,
} from '../../../utils/CommonUtils';
import { getScheduleOptionsFromSchedules } from '../../../utils/ScheduleUtils';
import { getEntityName } from '../../../utils/EntityUtils';
import { getIngestionName } from '../../../utils/ServiceUtils';
import { generateUUID } from '../../../utils/StringsUtils';
import { showErrorToast } from '../../../utils/ToastUtils';
import { getWeekCron } from '../../common/CronEditor/CronEditor.constant';
import SuccessScreen from '../../common/SuccessScreen/SuccessScreen';
import DeployIngestionLoaderModal from '../../Modals/DeployIngestionLoaderModal/DeployIngestionLoaderModal';
import {
  TestSuiteIngestionDataType,
  TestSuiteIngestionProps,
} from './AddDataQualityTest.interface';
import TestSuiteScheduler from './components/TestSuiteScheduler';

const TestSuiteIngestion: React.FC<TestSuiteIngestionProps> = ({
  ingestionPipeline,
  testSuite,
  onCancel,
  testCaseNames,
  pipelineName,
}) => {
  const { ingestionFQN } = useFqn();
  const history = useHistory();
  const { t } = useTranslation();
  const [ingestionData, setIngestionData] = useState<
    IngestionPipeline | undefined
  >(ingestionPipeline);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showDeployButton, setShowDeployButton] = useState(false);
  const [ingestionAction, setIngestionAction] = useState(
    ingestionFQN
      ? IngestionActionMessage.UPDATING
      : IngestionActionMessage.CREATING
  );
  const [isIngestionDeployed, setIsIngestionDeployed] = useState(false);
  const [isIngestionCreated, setIsIngestionCreated] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { config } = useLimitStore();

  const { pipelineSchedules } =
    config?.limits?.config.featureLimits.find(
      (feature) => feature.name === 'dataQuality'
    ) ?? {};

  const schedulerOptions = useMemo(() => {
    if (isEmpty(pipelineSchedules) || !pipelineSchedules) {
      return undefined;
    }

    return getScheduleOptionsFromSchedules(pipelineSchedules);
  }, [pipelineSchedules]);

  const getSuccessMessage = useMemo(() => {
    return (
      <Transi18next
        i18nKey={
          showDeployButton
            ? 'message.failed-status-for-entity-deploy'
            : 'message.success-status-for-entity-deploy'
        }
        renderElement={<strong />}
        values={{
          entity: `"${
            pipelineName ??
            getEntityName(ingestionData) ??
            t('label.test-suite')
          }"`,
          entityStatus: ingestionFQN
            ? t('label.updated-lowercase')
            : t('label.created-lowercase'),
        }}
      />
    );
  }, [ingestionData, showDeployButton, pipelineName]);

  const initialFormData = useMemo(() => {
    return {
      repeatFrequency:
        ingestionPipeline?.airflowConfig.scheduleInterval ?? config?.enable
          ? getWeekCron({ hour: 0, min: 0, dow: 0 })
          : getIngestionFrequency(PipelineType.TestSuite),
      enableDebugLog: ingestionPipeline?.loggerLevel === LogLevels.Debug,
    };
  }, [ingestionPipeline]);

  const handleIngestionDeploy = (id?: string) => {
    setShowDeployModal(true);

    setIsIngestionCreated(true);
    setIngestionProgress(INGESTION_PROGRESS_END_VAL);
    setIngestionAction(IngestionActionMessage.DEPLOYING);

    deployIngestionPipelineById(`${id || ingestionData?.id}`)
      .then(() => {
        setIsIngestionDeployed(true);
        setShowDeployButton(false);
        setIngestionProgress(DEPLOYED_PROGRESS_VAL);
        setIngestionAction(IngestionActionMessage.DEPLOYED);
      })
      .catch((err: AxiosError) => {
        setShowDeployButton(true);
        setIngestionAction(IngestionActionMessage.DEPLOYING_ERROR);
        showErrorToast(
          err,
          t('server.deploy-entity-error', {
            entity: t('label.ingestion-workflow-lowercase'),
          })
        );
      })
      .finally(() => setTimeout(() => setShowDeployModal(false), 500));
  };

  const createIngestionPipeline = async (data: TestSuiteIngestionDataType) => {
    const tableName = replaceAllSpacialCharWith_(
      getNameFromFQN(
        testSuite.executableEntityReference?.fullyQualifiedName ?? ''
      )
    );
    const updatedName =
      pipelineName ?? getIngestionName(tableName, PipelineType.TestSuite);

    const ingestionPayload: CreateIngestionPipeline = {
      airflowConfig: {
        scheduleInterval: isEmpty(data.repeatFrequency)
          ? undefined
          : data.repeatFrequency,
      },
      displayName: updatedName,
      name: generateUUID(),
      loggerLevel: data.enableDebugLog ? LogLevels.Debug : LogLevels.Info,
      pipelineType: PipelineType.TestSuite,
      service: {
        id: testSuite.id ?? '',
        type: camelCase(PipelineType.TestSuite),
      },
      sourceConfig: {
        config: {
          type: ConfigType.TestSuite,
          entityFullyQualifiedName:
            testSuite.executableEntityReference?.fullyQualifiedName,
          testCases: testCaseNames,
        },
      },
    };

    const ingestion = await addIngestionPipeline(ingestionPayload);

    setIngestionData(ingestion);
    handleIngestionDeploy(ingestion.id);
  };

  const onUpdateIngestionPipeline = async (
    data: TestSuiteIngestionDataType
  ) => {
    if (isUndefined(ingestionPipeline)) {
      return;
    }

    const updatedPipelineData = {
      ...ingestionPipeline,
      displayName: pipelineName,
      airflowConfig: {
        ...ingestionPipeline?.airflowConfig,
        scheduleInterval: isEmpty(data.repeatFrequency)
          ? undefined
          : data.repeatFrequency,
      },
      loggerLevel: data.enableDebugLog ? LogLevels.Debug : LogLevels.Info,
      sourceConfig: {
        ...ingestionPipeline?.sourceConfig,
        config: {
          ...ingestionPipeline?.sourceConfig.config,
          testCases: testCaseNames,
        },
      },
    };
    const jsonPatch = compare(ingestionPipeline, updatedPipelineData);
    try {
      const response = await updateIngestionPipeline(
        ingestionPipeline?.id ?? '',
        jsonPatch
      );
      handleIngestionDeploy(response.id);
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('server.entity-updating-error', {
          entity: t('label.ingestion-workflow-lowercase'),
        })
      );
    }
  };

  const handleIngestionSubmit = useCallback(
    async (data: TestSuiteIngestionDataType) => {
      setIsLoading(true);
      if (ingestionFQN) {
        await onUpdateIngestionPipeline(data);
      } else {
        await createIngestionPipeline(data);
      }
      setIsLoading(false);
    },
    [
      ingestionFQN,
      onUpdateIngestionPipeline,
      createIngestionPipeline,
      ingestionPipeline,
    ]
  );

  const handleViewTestSuiteClick = useCallback(() => {
    history.goBack();
  }, [history]);

  const handleDeployClick = () => {
    setShowDeployModal(true);
    handleIngestionDeploy();
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Typography.Text className="font-medium" data-testid="header">
          {t('label.schedule-for-ingestion')}
        </Typography.Text>
      </Col>

      <Col span={24}>
        {isIngestionCreated ? (
          <SuccessScreen
            handleDeployClick={handleDeployClick}
            handleViewServiceClick={handleViewTestSuiteClick}
            name={`${testSuite?.name}_${PipelineType.TestSuite}`}
            showDeployButton={showDeployButton}
            showIngestionButton={false}
            state={FormSubmitType.ADD}
            successMessage={getSuccessMessage}
            viewServiceText={t('label.view-entity', {
              entity: t('label.test-suite'),
            })}
          />
        ) : (
          <TestSuiteScheduler
            allowEnableDebugLog
            includePeriodOptions={schedulerOptions}
            initialData={initialFormData}
            isLoading={isLoading}
            onCancel={onCancel}
            onSubmit={handleIngestionSubmit}
          />
        )}
      </Col>
      <DeployIngestionLoaderModal
        action={ingestionAction}
        ingestionName={pipelineName ?? getEntityName(ingestionData)}
        isDeployed={isIngestionDeployed}
        isIngestionCreated={isIngestionCreated}
        progress={ingestionProgress}
        visible={showDeployModal}
      />
    </Row>
  );
};

export default TestSuiteIngestion;
