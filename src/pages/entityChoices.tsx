import SearchField from '@/components/ui/searchField';
import React, { useState } from 'react'
import entitiesJSON from '@/JSONdata/entities.json'
import Header from '@/components/landing/Header';
import EntityCard from '@/components/ui/entityCard';
import Footer from '@/components/landing/Footer';
import { entityAssets } from "@/assets/entityAssets";


function EntityChoices() {
  const entities = entitiesJSON

  const [filteredList, setFilteredList] = useState(entities);

  const filterData = (data: string) => {
    setFilteredList([])
    setFilteredList(entities.filter((e) => {
      return e.entityName.toLowerCase().includes(data.toLowerCase());
    }))
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className='w-full h-screen min-h-max bg-white pt-44 p-16'>
        <h2 className='text-4xl font-semibold mb-7'>Choississez votre entité </h2>
        <SearchField filteringFnc={filterData} />
        <p className='w-[500px] mx-auto text-center text-neutral-500 p-6'>Cliquez sur votre entité pour accéder à son espace</p>
        {filteredList.length != 0 ?

          <div className='w-full max-w-[70vw] max-xl:max-w-[80vw] max-sm:max-w-[90vw] h-max mx-auto mt-10 grid grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1  gap-10 items-center justify-items-center'>
            {
              filteredList.map((e) => {
                const assets = entityAssets[e.entityName];
                return (
                  <EntityCard key={filteredList.indexOf(e)} entityId={e.id} logo={assets.logo} image={assets.image} entityName={e.entityName} slogan={e.slogan} disabled={e.disabled} />
                );
              })
            }

          </div>
          :
          <div className='w-full h-full flex flex-col items-center justify-center font-semibold text-neutral-300'>
            <p>{">-<"}</p>
            <p>Aucun résultat trouvé</p>
          </div>
        }
      </section>
      <Footer />
    </div>
  );
}

export default EntityChoices
