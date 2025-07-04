<template>
  <v-container
    class="d-flex fill-height pa-0 align-stretch flex-column flex-nowrap"
    fluid
  >
    <v-row class="flex-grow-0 no-gutters">
      <v-col>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row class="flex-grow-1" no-gutters>
      <v-col class="config-column" cols="3">
        <v-row class="py-2 px-2 px-xl-3 px-xxl-6">
          <v-col cols="6" class="d-flex align-center">
            <v-card-title>Découpage :</v-card-title>
          </v-col>
          <v-col cols="6">
            <v-switch
              v-model="isHexagon"
              hide-details
              class="font-weight-medium"
              :label="`${isHexagon ? 'Hexagon' : 'Polygon'}`"
            ></v-switch>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <DemandConfigColumn
          v-model:variables="demandVariables"
          v-model:year-selected="selectedYear"
          v-model:distance-selected="selectedDistance"
          :on-reset-session-storage="resetSessionStorage"
        >
        </DemandConfigColumn>
        <v-divider></v-divider>

        <SupplyConfigColumn
          v-model:variables="supplyVariables"
          :on-reset-session-storage="resetSessionStorage"
        >
        </SupplyConfigColumn>

        <v-divider></v-divider>

        <v-card-actions class="pt-4 px-2 px-xl-3 px-xxl-6">
          <v-btn @click="resetSessionStorage" variant="flat">
            Réinitialiser
          </v-btn>
        </v-card-actions>

        <v-divider vertical></v-divider>
      </v-col>

      <v-col cols="9" class="map-column">
        <v-row class="fill-height" no-gutters>
          <v-col cols="6" class="relative pa-0">
            <VectorsMap
              class="left-map"
              :demandVariables="selectedDemandVariables"
              :supplyVariables="selectedSupplyVariables"
              :list-tiles-params="listTilesParams"
              :selected-tiles-name="selectedTilesSource.demand"
              :colors="demandColors"
              :year="selectedYear"
              :distance="selectedDistance"
              :has-geocoder-search="false"
              @created:map="leftMap = $event"
            >
            </VectorsMap>
            <v-card-title class="overmap font-weight-medium"
              >Demande</v-card-title
            >
            <legend-map class="legend-left" reverse :colors="demandColors" />
          </v-col>
          <v-divider vertical></v-divider>

          <v-col cols="6" class="relative pa-0">
            <VectorsMap
              class="right-map"
              :demandVariables="selectedDemandVariables"
              :supplyVariables="selectedSupplyVariables"
              :list-tiles-params="listTilesParams"
              :selected-tiles-name="selectedTilesSource.supply"
              :colors="supplyColors"
              :year="selectedYear"
              :distance="selectedDistance"
              :has-geocoder-search="true"
              @created:map="rightMap = $event"
            ></VectorsMap>
            <legend-map :colors="supplyColors" />
            <v-card-title class="overmap font-weight-medium"
              >Offre</v-card-title
            >
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import type { Map as MaplibreMap } from "maplibre-gl";
import { syncMaps } from "@/utils/syncmap";

import LegendMap from "@/components/LegendMap.vue";
import VectorsMap from "@/components/VectorsMap.vue";
import SupplyConfigColumn from "@/components/SupplyConfigColumn.vue";
import { ref, computed, watch } from "vue";
import {
  supplyColors,
  listDistances,
  listVariablesDemand,
  listVariablesSupply,
  listTilesParams,
  listYears,
  demandColors,
} from "@/utils/variables";
import type {
  TileParams,
  MapType,
  TilingType,
  DemandVariable,
  SupplyVariable,
} from "@/utils/variables";
import DemandConfigColumn from "@/components/DemandConfigColumn.vue";

const storageTilingTypeSource = "selectedTilingType",
  storageItemTilingType = sessionStorage.getItem(storageTilingTypeSource),
  savedTilingType: TilingType = storageItemTilingType
    ? (storageItemTilingType as TilingType)
    : "h3";

const selectedTilingType = ref(savedTilingType);
const isHexagon = computed({
  get() {
    return selectedTilingType.value === "h3";
  },
  set(value) {
    selectedTilingType.value = value ? "h3" : "polygon";
  },
});

const defaultDemandVariables: DemandVariable[] = listVariablesDemand.map(
  ({ id, name }) => ({
    id,
    name,
    selected: id == "All_modes",
  }),
);

const storageKeyDemandVariables = "selectedDemandVariables",
  storageItemDemandVariables = sessionStorage.getItem(
    storageKeyDemandVariables,
  ),
  savedDemandVariables = storageItemDemandVariables
    ? (JSON.parse(storageItemDemandVariables) as DemandVariable[])
    : JSON.parse(JSON.stringify(defaultDemandVariables));

const demandVariables = ref<DemandVariable[]>(savedDemandVariables);

const selectedDemandVariables = computed(() => {
  //I added weight so it update props when weight change
  return demandVariables.value.filter(({ selected }) => selected);
});

const defaultSupplyVariables: SupplyVariable[] = listVariablesSupply.map(
  ({ id, name, infos }) => ({
    id,
    name,
    weight: 1,
    diversity: 5,
    infos,
    selected: id == "All",
  }),
);

const storageKeySupplyVariables = "selectedSupplyVariables",
  storageItemSupplyVariables = sessionStorage.getItem(
    storageKeySupplyVariables,
  ),
  savedSupplyVariables = storageItemSupplyVariables
    ? (JSON.parse(storageItemSupplyVariables) as SupplyVariable[])
    : JSON.parse(JSON.stringify(defaultSupplyVariables));

const supplyVariables = ref<SupplyVariable[]>(savedSupplyVariables);

const selectedSupplyVariables = computed(() => {
  //I added weight so it update props when weight change
  return supplyVariables.value.filter(
    ({ selected, weight }) => selected && weight > 0,
  );
});

const selectedTilesSource = computed(() => {
  const filteredTiles = listTilesParams.filter(({ name }) =>
    isHexagon.value ? name.includes("h3") : name.includes("polygon"),
  );
  return {
    demand: filteredTiles.find(({ name }) => name.includes("demand"))
      ?.name as string,
    supply: filteredTiles.find(({ name }) => name.includes("supply"))
      ?.name as string,
  };
});

const storageYearSource = "selectedYear",
  storageItemYear = sessionStorage.getItem(storageYearSource),
  savedYear = storageItemYear ? Number(storageItemYear) : listYears[0];

const selectedYear = ref(savedYear);

const storageDistanceSource = "selectedDistance",
  storageItemDistance = sessionStorage.getItem(storageDistanceSource),
  savedDistance = storageItemDistance
    ? Number(storageItemDistance)
    : listDistances[listDistances.length - 1];
const selectedDistance = ref(savedDistance);

watch(selectedDistance, (newDistance) =>
  sessionStorage.setItem(storageDistanceSource, newDistance.toString()),
);
watch(selectedYear, (newYear) =>
  sessionStorage.setItem(storageYearSource, newYear.toString()),
);
watch(selectedDemandVariables, () =>
  sessionStorage.setItem(
    storageKeyDemandVariables,
    JSON.stringify(demandVariables.value),
  ),
);
watch(selectedSupplyVariables, () =>
  sessionStorage.setItem(
    storageKeySupplyVariables,
    JSON.stringify(supplyVariables.value),
  ),
);

watch(selectedTilingType, () => {
  sessionStorage.setItem(storageTilingTypeSource, selectedTilingType.value);
});

function resetSessionStorage() {
  demandVariables.value = JSON.parse(JSON.stringify(defaultDemandVariables));
  supplyVariables.value = JSON.parse(JSON.stringify(defaultSupplyVariables));
  selectedDistance.value = listDistances[listDistances.length - 1];
  selectedYear.value = listYears[0];
}

const leftMap = ref<MaplibreMap>();
const rightMap = ref<MaplibreMap>();

watch(
  () => ({ leftMap: leftMap.value, rightMap: rightMap.value }),
  ({ leftMap, rightMap }) => {
    if (leftMap !== undefined && rightMap !== undefined) {
      syncMaps([leftMap, rightMap]);
    }
  },
);
</script>

<style scoped>
.relative {
  position: relative;
}
.overmap {
  position: absolute;
  top: 2.5em;
  padding: 0.6em 2em;
  border-radius: 0.3em;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  width: fit-content;
}

.config-column {
  max-height: calc(100vh - 65px);
  overflow-y: scroll;
  overflow-x: hidden;
  max-width: 340px;
  min-width: 290px;
  flex: 1 1;
}

.map-column {
  max-width: none;
  flex: 1 1;
}
</style>
