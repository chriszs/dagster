import {useQuery} from '@apollo/client';
import {Box, NonIdealState} from '@dagster-io/ui';
import React from 'react';

import {PythonErrorInfo} from '../app/PythonErrorInfo';
import {useQueryRefreshAtInterval} from '../app/QueryRefresh';
import {useTrackPageView} from '../app/analytics';
import {graphql} from '../graphql';
import {InstigationType} from '../graphql/graphql';
import {useDocumentTitle} from '../hooks/useDocumentTitle';
import {UnloadableSensors} from '../instigation/Unloadable';
import {Loading} from '../ui/Loading';
import {repoAddressAsHumanString} from '../workspace/repoAddressAsString';
import {repoAddressToSelector} from '../workspace/repoAddressToSelector';
import {RepoAddress} from '../workspace/types';

import {SensorInfo} from './SensorInfo';
import {SensorsTable} from './SensorsTable';

interface Props {
  repoAddress: RepoAddress;
}

export const SensorsRoot = (props: Props) => {
  useTrackPageView();
  useDocumentTitle('Sensors');

  const {repoAddress} = props;
  const repositorySelector = repoAddressToSelector(repoAddress);
  const repoName = repoAddressAsHumanString(repoAddress);

  const queryResult = useQuery(SENSORS_ROOT_QUERY, {
    variables: {
      repositorySelector,
      instigationType: InstigationType.SENSOR,
    },
    partialRefetch: true,
    notifyOnNetworkStatusChange: true,
  });

  useQueryRefreshAtInterval(queryResult, 50 * 1000);

  return (
    <Loading queryResult={queryResult} allowStaleData={true}>
      {(result) => {
        const {sensorsOrError, unloadableInstigationStatesOrError, instance} = result;
        const content = () => {
          if (sensorsOrError.__typename === 'PythonError') {
            return <PythonErrorInfo error={sensorsOrError} />;
          } else if (unloadableInstigationStatesOrError.__typename === 'PythonError') {
            return <PythonErrorInfo error={unloadableInstigationStatesOrError} />;
          } else if (sensorsOrError.__typename === 'RepositoryNotFoundError') {
            return (
              <Box padding={{vertical: 64}}>
                <NonIdealState
                  icon="error"
                  title="Definitions not found"
                  description={`Could not load definitions for ${repoName}`}
                />
              </Box>
            );
          } else if (!sensorsOrError.results.length) {
            return (
              <Box padding={{vertical: 64}}>
                <NonIdealState
                  icon="sensors"
                  title="No sensors defined"
                  description={
                    <p>
                      {repoName} does not have any sensors defined. Visit the{' '}
                      <a
                        href="https://docs.dagster.io/concepts/partitions-schedules-sensors/sensors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        sensors documentation
                      </a>{' '}
                      for more information about creating sensors in Dagster.
                    </p>
                  }
                />
              </Box>
            );
          } else {
            return (
              <>
                {sensorsOrError.results.length > 0 && (
                  <SensorInfo
                    daemonHealth={instance.daemonHealth}
                    padding={{horizontal: 24, vertical: 16}}
                  />
                )}
                <SensorsTable repoAddress={repoAddress} sensors={sensorsOrError.results} />
                <UnloadableSensors sensorStates={unloadableInstigationStatesOrError.results} />
              </>
            );
          }
        };

        return <div>{content()}</div>;
      }}
    </Loading>
  );
};

const SENSORS_ROOT_QUERY = graphql(`
  query SensorsRootQuery(
    $repositorySelector: RepositorySelector!
    $instigationType: InstigationType!
  ) {
    sensorsOrError(repositorySelector: $repositorySelector) {
      __typename
      ...PythonErrorFragment
      ... on Sensors {
        results {
          id
          ...SensorFragment
        }
      }
    }
    unloadableInstigationStatesOrError(instigationType: $instigationType) {
      ... on InstigationStates {
        results {
          id
          ...InstigationStateFragment
        }
      }
      ...PythonErrorFragment
    }
    instance {
      ...InstanceHealthFragment
    }
  }
`);
