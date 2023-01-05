import graphene
from dagster_graphql.schema.errors import GraphenePythonError, GrapheneRepositoryNotFoundError
from dagster_graphql.schema.util import non_null_list

import dagster._check as check
from dagster._core.host_representation.external import ExternalResource
from dagster._core.snap import ConfigSchemaSnapshot, ResourceDefSnap

from .config_types import GrapheneConfigTypeField


class GrapheneTopLevelResource(graphene.ObjectType):
    name = graphene.NonNull(graphene.String)

    class Meta:
        name = "TopLevelResource"

    def __init__(self, external_resource: ExternalResource):
        super().__init__()
        self._external_resource = check.inst_param(
            external_resource, "external_resource", ExternalResource
        )
        self.name = external_resource.name


class GrapheneTopLevelResources(graphene.ObjectType):
    results = non_null_list(GrapheneTopLevelResource)

    class Meta:
        name = "TopLevelResources"


class GrapheneTopLevelResourcesOrError(graphene.Union):
    class Meta:
        types = (GrapheneTopLevelResources, GrapheneRepositoryNotFoundError, GraphenePythonError)
        name = "ResourcesOrError"
