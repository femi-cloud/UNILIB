// <div className='bg-neutral-50 w-full h-full rounded-3xl border-2 border-neutral-100 p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center'>
//   <img src={logo} alt="entity_logo" className='h-1/2' />
//   <div className='w-full h-max m-5'>
//     <h2 className='text-lg text-neutral-700 font-semibold bg-white'>{entityName}</h2>
//   </div>
// </div>
import React from 'react'
import { useNavigate } from 'react-router-dom'

function EntityCard({ entityId = null, image = "/src/assets/image_placeholder.png", logo = "/src/assets/logo_placeholder.png", entityName = "Entity", slogan = "Bientot", disabled = false }) {
  const navigate = useNavigate();
  const img = (image.trim() != "") ? image : "/src/assets/image_placeholder.png";
  const lg = (logo.trim() != "") ? logo : "/src/assets/logo_placeholder.png";
  const slgn = (slogan.trim() != "") ? slogan : "Bientot";
  const entName = (entityName.trim() != "") ? entityName : "Entity";



  const handleNavigate = (link: string) => {
    // if (disabled == false) {
    //   navigate(link)
    // } else {
    //   console.log("Disabled");
    // };
    navigate(link)
  }

  return (
    <div
      onClick={() => (disabled == true) ? handleNavigate("/coming-soon") : handleNavigate(`/e-fri`)}
      // onClick={() => handleNavigate(`/auth/${entityId}`)}
      className={`p-4 w-full aspect-[5/4] rounded-3xl  ${!disabled ? "border-2 border-neutral-100 hover:shadow-lg shadow-sm shadow-neutral-100" : ""} transition-shadow duration-300 bg-white max-w-80 relative`}>
      <div className={`group w-full h-full rounded-3xl items-center justify-center flex bg-neutral-600/20 ${disabled ? "block" : "hidden"} absolute top-0 left-0`}>
        <span className='px-4 py-2 text-white/0 bg-black/0 rounded-md group-hover:bg-black/70 group-hover:text-white/90 transition-color duration-500 ease-out select-none'>Bientot disponible</span>
      </div>
      <div
      style={{backgroundImage:`url(${img})`}} 
      className="rounded-md w-full aspect-[275/183] mx-auto bg-center bg-cover">

      </div>
      <div className='flex flex-row items-center justify-between'>
        <div className='mt-3'>
          <p className="text-gray-900 text-xl font-semibold uppercase">{entName}</p>
          <p className="text-gray-500 text-sm">{slgn}</p>
          <p className="text-gray-900 font-semibold text-sm ">UAC</p>
        </div>
        <div className='min-w-[24px] max-w-[64px] aspect-square items-center justify-center w-1/3 rounded-full overflow-hidden'>
          <img style={{ filter: `${disabled == true ? "grayscale(100%)" : "grayscale(0%)"}` }} src={lg} alt="Logo entite" />
        </div>
      </div>
    </div>
  )
}

export default EntityCard
