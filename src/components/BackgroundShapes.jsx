import leftShape from '../assets/left-shape.png'
import rightShape from '../assets/right-shape.png'

function BackgroundShapes({ showRight = true }) {
  return (
    <>
      <img
        alt=""
       className="pointer-events-none absolute bottom-[-199px] left-[-120px] hidden w-[315px]  rotate-[12deg] md:block lg:bottom-[-120px] lg:left- -3 lg:w-[415px]"
        src={leftShape}
      />
      {showRight && (
        <img
          alt=""
          className="pointer-events-none absolute right-[-120px] top-[-199px] hidden w-[315px] md:block lg:right-0 lg:top-[-30px] lg:w-[315px]"
          src={rightShape}
        />
      )}
    </>
  )
}

export default BackgroundShapes
