<script setup>
// import countries from '@/data/countries.json';
// import sectors from '@/data/sectors.json';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/user';
const router = useRouter();
const { t } = useI18n();
// import sectors from '../../composables/sectors'
const { data: session } = useAuth();

const firstName = computed(() => session.value?.name.split(" ")[0] || '');
const lastName = computed(() => session.value?.name.split(" ")[1] || '');
const runtimeConfig = useRuntimeConfig();
const profile = {
    name: '',
    surname: '',
    email: '',
    organisation: {
        name: '',
        address: '',
        street: '',
        streetLine2: '',
        number: '',
        postCode: '',
        city: '',
        country: '',
        manufacturingSector: '',
        size: '',
        profitOperation: '',
        ownership: '',
        scope: '',
    },
    participantID: '',
};

const schema = {
    name: 'string|required',
    surname: 'string|required',
    email: 'string|email|required',
    organisation: {
        name: 'string|required',
        address: 'string|required',
        country: 'string|required',
        manufacturingSector: 'string|required',
        size: 'string|required',
        profitOperation: 'string|required',
        ownership: 'string|required',
        scope: 'string|required',
    },
};
//FIXME: Change this to retrieve info from keycloak

const { data: user } = await useFetch('/api/users/get-user', {
    method: 'GET',
    query: { id: "a517ac00-6d23-40cb-a55d-89bec4afe8c1" },
});
console.log(user.value)
</script>

<template>
    <PageContainer>
        <div class=" mx-auto p-4 bg-white border border-neutral-200 rounded-md">
            <UCard>
                <template #header>
                    <SubHeading :title="$t('user.user')" :info="$t('user.info')" />
                </template>

                <UForm v-if="user" class="flex flex-col space-y-2 " :state="profile" :schema="schema"
                    :validate-on="['input', 'submit', 'blur', 'change']">

                    <div class="flex flex-row w-full space-x-2">
                        <!-- Name -->

                        <UFormGroup :label="$t('user.firstname')" required name="name">
                            <UInput :disabled="true" v-model="firstName" />
                        </UFormGroup>

                        <!-- Surname -->
                        <UFormGroup :label="$t('user.surname')" required name="surname">
                            <UInput :disabled="true" v-model="lastName" />
                        </UFormGroup>
                        <!-- Email -->
                        <UFormGroup :label="$t('user.email')" required name="email">
                            <UInput :disabled="true" v-model="session.user.email" type="email" />
                        </UFormGroup>
                        <!-- Country -->
                        <UFormGroup :label="$t('user.organisation.country')" required name="organisation.country">
                            <USelectMenu :disabled="true" v-model="session.user.country" :options="countries" />
                        </UFormGroup>
                    </div>
                    <div class="flex flex-row w-full space-x-2">
                        <!-- Organisation -->
                        <UFormGroup :label="$t('user.organisation.name')" required name="organisation.name">
                            <UInput :disabled="true" v-model="session.user.owner" />
                        </UFormGroup>

                        <UFormGroup :label="$t('user.organisation.address')" required name="organisation.address">
                            <UInput :disabled="true" v-model="session.user.address" />
                        </UFormGroup>

                        <UFormGroup :label="$t('user.organisation.street')" required name="organisation.street">
                            <UInput :disabled="true" v-model="session.user.street" />
                        </UFormGroup>

                        <UFormGroup :label="$t('user.organisation.streetLine2')" name="organisation.streetLine2">
                            <UInput :disabled="true" v-model="session.user.streetLine2" />
                        </UFormGroup>

                    </div>
                    <div class="flex flex-row w-full space-x-2">
                        <UFormGroup :label="$t('user.organisation.number')" required name="organisation.number">
                            <UInput :disabled="true" v-model="session.user.number" />
                        </UFormGroup>

                        <UFormGroup :label="$t('user.organisation.postCode')" required name="organisation.postCode">
                            <UInput :disabled="true" v-model="session.user.postCode" />
                        </UFormGroup>

                        <UFormGroup :label="$t('user.organisation.city')" required name="organisation.city">
                            <UInput :disabled="true" v-model="session.user.city" />
                        </UFormGroup>

                    </div>
                    <div class="flex flex-row w-full space-x-2">
                        <!-- Manufacturing Sector -->
                        <UFormGroup :label="$t('user.organisation.sector')" required
                            name="organisation.manufacturingSector">
                            <USelectMenu :disabled="true" v-model="session.user.domain" :options="sectors" />
                        </UFormGroup>

                        <!-- Organisation Size -->
                        <UFormGroup :label="$t('user.organisation.size')" required name="organisation.size">
                            <USelectMenu v-model="session.user.size" :disabled="true"
                                :options="['Small (1-50)', 'Medium (151-250)', 'Large (251+)', 'Enterprise (1,000+)']" />
                        </UFormGroup>

                        <!-- Profit Operation -->
                        <UFormGroup :label="$t('user.organisation.profitOperation')" required
                            name="organisation.profitOperation">
                            <USelectMenu v-model="session.user.operations" :disabled="true"
                                :options="['For Profit', 'Non Profit', 'Social Enterprise']" />
                        </UFormGroup>
                    </div>
                    <div class="flex flex-row w-full space-x-2">

                        <!-- Ownership -->
                        <UFormGroup :label="$t('user.organisation.ownership')" required name="organisation.ownership">
                            <USelectMenu :disabled="true" v-model="session.user.ownerControl" :options="[
                                'Privately Held',
                                'Publicly Traded',
                                'Government-Owned',
                                'Cooperatives'
                            ]" />
                        </UFormGroup>

                        <!-- Geographical Scope -->
                        <UFormGroup :label="$t('user.organisation.scope')" required name="organisation.scope">
                            <USelectMenu :disabled="true" v-model="session.user.geoScope" :options="['Local', 'National', 'Multinational']" />
                        </UFormGroup>

                        <!-- AI-REDGIO ID -->
                        <UFormGroup :label="$t('user.participantID')" required name="participantID">
                            <UInput :disabled="true" v-model="session.user.hash" />
                        </UFormGroup>
                    </div>
                    <!-- <UButton class="px-4 py-2 w-32 block" @click="saveProfile">
                        <UIcon v-if="submitStatus === 'pending'" name="svg-spinners:270-ring-with-bg" />
                        <span v-else> {{ $t('submit') }}</span>
                    </UButton> -->
                </UForm>
            </UCard>
        </div>
    </PageContainer>
</template>
