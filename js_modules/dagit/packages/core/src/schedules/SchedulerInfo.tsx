import {Alert, Box} from '@dagster-io/ui';
import * as React from 'react';

import {DaemonHealthFragmentFragment} from '../graphql/graphql';

type Props = React.ComponentPropsWithRef<typeof Box> & {
  daemonHealth: DaemonHealthFragmentFragment | undefined;
};

export const SchedulerInfo: React.FC<Props> = ({daemonHealth, ...boxProps}) => {
  let healthy = undefined;

  if (daemonHealth) {
    const schedulerHealths = daemonHealth.allDaemonStatuses.filter(
      (daemon) => daemon.daemonType === 'SCHEDULER',
    );
    if (schedulerHealths) {
      const schedulerHealth = schedulerHealths[0];
      healthy = !!(schedulerHealth.required && schedulerHealth.healthy);
    }
  }

  if (healthy === false) {
    return (
      <Box {...boxProps}>
        <Alert
          intent="warning"
          title="The scheduler daemon is not running."
          description={
            <div>
              See the{' '}
              <a href="https://docs.dagster.io/deployment/dagster-daemon">
                dagster-daemon documentation
              </a>{' '}
              for more information on how to deploy the dagster-daemon process.
            </div>
          }
        />
      </Box>
    );
  }

  return null;
};
