import BrandMark from "../../../components/BrandMark";
import BackgroundShapes from "../../../components/BackgroundShapes";
import AuthAside from "./AuthAside";

function AuthLayout({ children }) {
  return (
    <main className="h-screen overflow-hidden bg-[#F3F3F3]">
      <section className="grid h-full lg:grid-cols-2">
        {/* LEFT */}
        <div
          className="
            relative
            flex
            h-full
            flex-col
            overflow-hidden
            px-[44px]
            pt-[26px]
            pb-[28px]
          "
        >
          <BackgroundShapes showRight={false} />

          {/* Logo */}
          <div className="relative z-10">
            <div className="origin-top-left scale-[0.93]">
              <BrandMark />
            </div>
          </div>

          {/* Login */}
          <div
            className="
              relative
              z-10
              flex
              flex-1
              items-center
              justify-center
              -mt-2
            "
          >
            {children}
          </div>
        </div>

        {/* RIGHT */}
        <AuthAside />
      </section>
    </main>
  );
}

export default AuthLayout;