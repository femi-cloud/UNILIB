import { SearchIcon } from 'lucide-react'
import React, { useState } from 'react'

function SearchField({ filteringFnc }) {

    return (
        <div className="flex flex-row items-center justify-between w-max bg-white p-2 px-4 rounded-full border-2 border-neutral-300">
            <input
                className='px-2 text-sm bg-green focus:ring-0 focus:outline-none text-neutral-700'
                type="text"
                placeholder='Recherchez votre entité...'
                onChange={
                    (e) => {
                        filteringFnc(e.target.value)
                    }}
            />
            <SearchIcon className='size-6 text-neutral-400' />
        </div>
    )
}

export default SearchField
