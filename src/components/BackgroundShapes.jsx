import leftShape from '../assets/left-shape.png'
import rightShape from '../assets/right-shape.png'

function BackgroundShapes({ showRight = true }) {
  return (
    <>
      <img
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-[min(70vw,430px)] sm:w-[min(38vw,520px)]"
        src={leftShape}
      />
      {showRight && (
        <img
          alt=""
          className="pointer-events-none absolute right-[-110px] top-[-20px] hidden w-[520px] md:block lg:right-0 lg:top-0 lg:w-[560px]"
          src={rightShape}
        />
      )}
    </>
  )
}

export default BackgroundShapes
