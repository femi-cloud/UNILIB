import React from 'react'
import { useNavigate } from 'react-router-dom'

function ComingSoon() {
  const navigate = useNavigate()
  const handleNavigate = (link) => {
    navigate(link)
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <img src="public/building-website.svg" alt="building-websites" className='w-[40vw] max-w-[500px] min-w-[200px] mx-auto mb-20' />
        <h1 className="mb-4 text-4xl font-bold">L'espace dédié à cette entité sera bientôt disponible.</h1>
        <p className="mb-4 text-xl text-muted-foreground">Très bientôt...</p>
        <a onClick={() => handleNavigate(-1)} className="text-primary underline hover:text-primary/90 cursor-pointer">
          Retour au menu
        </a>
      </div>
    </div>
  )
}

export default ComingSoon
