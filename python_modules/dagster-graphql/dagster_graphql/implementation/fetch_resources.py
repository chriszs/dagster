from graphene import ResolveInfo

import dagster._check as check
from dagster._core.host_representation import RepositorySelector
from dagster._core.host_representation.repository_location import RepositoryLocation

from .loader import RepositoryScopedBatchLoader
from .utils import capture_error


@capture_error
def get_resources_or_error(graphene_info, repository_selector):
    from ..schema.resources import GrapheneTopLevelResource, GrapheneTopLevelResources

    check.inst_param(graphene_info, "graphene_info", ResolveInfo)
    check.inst_param(repository_selector, "repository_selector", RepositorySelector)

    location: RepositoryLocation = graphene_info.context.get_repository_location(
        repository_selector.location_name
    )
    repository = location.get_repository(repository_selector.repository_name)
    # batch_loader = RepositoryScopedBatchLoader(graphene_info.context.instance, repository)
    external_resources = repository.get_external_resources()

    results = [
        GrapheneTopLevelResource(external_resource) for external_resource in external_resources
    ]

    return GrapheneTopLevelResources(results=results)
