<script lang="ts" setup>
definePageMeta({
    // middleware: 'auth',
    auth: false,
    layout: 'home',
});

const { status, signIn } = useAuth();

const runtimeConfig = useRuntimeConfig();

const orgLogo = computed(() => runtimeConfig.public?.orgLogo || '');

const callbackUrl = '/home';
</script>

<template>
    <div class="w-full h-screen flex flex-col">
        <div
            class="w-full flex-1 flex flex-col bg-primary-950 bg-cover"
            :style="{ backgroundImage: `url('/img/cover.jpeg')` }"
        >
            <div class="bg-primary-950/80 flex-1">
                <div class="flex flex-col flex-1 max-w-7xl mx-auto">
                    <nav aria-label="Global" class="relative flex flex-row sm:items-center justify-between py-6">
                        <!-- Left Menu -->
                        <div class="flex flex-row space-x-10 items-center gap-2">
                            <div class="sm:w-full md:w-auto">
                                <NuxtLink :to="'/'" class="flex-shrink-0">
                                    <img
                                        v-if="orgLogo"
                                        class="h-12 sm:h-14"
                                        :src="`/img/${orgLogo}`"
                                        alt="Factory Logo"
                                    />
                                </NuxtLink>
                            </div>
                            <!-- v-if="status === 'authenticated'" -->
                            <NuxtLink
                                
                                :to="'/home/'"
                                class="flex-shrink-0 rounded-md px-4 py-2 text-lg font-medium text-white hover:primary-text-950 hover:border hover:border-white cursor-pointer transition-all"
                                >Home</NuxtLink
                            >
                        </div>
                        <!-- Right Menu - AI_REDIGIO logo -->
                        <div class="flex justify-center items-center">
                            <img class="h-12" src="/img/AI_REDIGIO.png" alt="AI_REDIGIO Logo" />
                        </div>
                    </nav>
                    <!-- Central Section/Main Content -->
                    <div class="flex flex-col items-center justify-center w-full gap-12 mt-32">
                        <h2 class="text-white font-semibold text-center tracking-wide text-2xl xl:text-4xl">
                            Data Connector
                        </h2>
                        <p class="font-light text-center tracking-wider text-sm lg:text-base text-white max-w-4xl">
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                        </p>
                        <!-- Sign In button -->
                        <div v-if="status !== 'authenticated'" class="flex">
                            <button
                                class="inline-flex items-center px-4 py-2 text-lg font-medium text-primary-800 bg-white border border-transparent rounded-md hover:primary-text-950 hover:bg-neutral-100 cursor-pointer transition-all"
                                @click="signIn('keycloak', { callbackUrl })"
                            >
                                Enter
                            </button>
                        </div>
                    </div>
                    <!-- end of whole content section -->
                </div>
            </div>
            <footer class="bg-primary-900 flex p-4 text-xs justify-center align-center">
                <div class="flex w-full max-w-[1210px] gap-4">
                    <img class="w-12 h-8" src="/img/eu_flag.jpeg" alt="AI_REDIGIO logo" />
                    <p class="text-white">
                        This project has received funding from the European Union under Grant Agreement n° 101092069.
                        Views and opinions expressed are however those of the author(s) only and do not necessarily
                        reflect those of the European Union or the European Commission. Neither the European Union nor
                        the granting authority can be held responsible for them.
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>
