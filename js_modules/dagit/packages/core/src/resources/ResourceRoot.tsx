import {Box, Colors, Heading, Page, PageHeader, SplitPanelContainer, Tag} from '@dagster-io/ui';
import * as React from 'react';
import {useParams} from 'react-router-dom';
import styled from 'styled-components/macro';

import {useTrackPageView} from '../app/analytics';
// import {ResourceFragmentFragment} from '../graphql/graphql';
import {useDocumentTitle} from '../hooks/useDocumentTitle';
import {RepositoryLink} from '../nav/RepositoryLink';
import {SidebarSection} from '../pipelines/SidebarComponents';
import {RepoAddress} from '../workspace/types';

interface Props {
  repoAddress: RepoAddress;
}

export const ResourceRoot: React.FC<Props> = (props) => {
  useTrackPageView();

  const {repoAddress} = props;

  const {resourceName} = useParams<{resourceName: string}>();

  useDocumentTitle(`Resource: ${resourceName}`);

  return (
    <Page>
      <PageHeader
        title={
          <Box flex={{direction: 'row', alignItems: 'center', gap: 12}}>
            <Heading>{resourceName}</Heading>
          </Box>
        }
      />
      <SplitPanelContainer
        identifier="explorer"
        firstInitialPercent={70}
        firstMinSize={400}
        first={<></>}
        second={
          <RightInfoPanel>
            <RightInfoPanelContent>
              <Box
                flex={{gap: 4, direction: 'column'}}
                margin={{left: 24, right: 12, vertical: 16}}
              >
                <Heading>{resourceName}</Heading>
              </Box>

              <SidebarSection title="Definition">
                <Box padding={{vertical: 16, horizontal: 24}}>
                  <Tag icon="resource">
                    Resource in <RepositoryLink repoAddress={repoAddress} showRefresh={false} />
                  </Tag>
                </Box>
              </SidebarSection>
              <SidebarSection title="Description">
                <Box padding={{vertical: 16, horizontal: 24}}>test</Box>
              </SidebarSection>
            </RightInfoPanelContent>
          </RightInfoPanel>
        }
      />
    </Page>
  );
};

export const RightInfoPanel = styled.div`
  // Fixes major perofmance hit. To reproduce, add enough content to
  // the sidebar that it scrolls (via overflow-y below) and then try
  // to pan the DAG.
  position: relative;

  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${Colors.White};
`;

export const RightInfoPanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;
