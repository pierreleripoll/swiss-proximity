<template>
  <v-app>
    <v-toolbar flat color="white" app>
      <v-toolbar-title text="SWISS PROXIMITY" />
      <v-spacer />
      <v-tabs
        class="flex-grow-1 flex-shrink-0 px-10 text-grey-darken-3"
        color="black"
        hide-slider
        background="light-grey"
        selected-class="tab-selected"
        align-tabs="center"
        grow
      >
        <v-tab to="/offre">Offre de proximité</v-tab>
        <v-tab to="/demande">Demande de proximité</v-tab>
        <v-tab to="/comparaison">Comparaison</v-tab>
      </v-tabs>
      <v-spacer />
      <v-btn @click="openInfos"> Infos </v-btn>
      <v-btn @click="openWelcome"> Welcome </v-btn>
    </v-toolbar>
    <v-main>
      <router-view></router-view>
      <simple-dialog v-model:open="openedInfo" button-text="Fermer">
        <info-dialog></info-dialog>
      </simple-dialog>
      <simple-dialog
        v-model:open="openedWelcome"
        storageKey="welcomeDialog"
        button-text="Commencer"
      >
        <welcome-dialog></welcome-dialog>
      </simple-dialog>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SimpleDialog from "@/components/SimpleDialog.vue";
import WelcomeDialog from "@/components/WelcomeDialog.vue";
import InfoDialog from "@/components/InfoDialog.vue";
import { ref } from "vue";

const openedInfo = ref(false);
const openedWelcome = ref(false);

const openInfos = () => {
  openedInfo.value = true;
  openedWelcome.value = false;
};
const openWelcome = () => {
  openedWelcome.value = true;
  openedInfo.value = false;
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  overflow: unset;
}

.tab-selected {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
