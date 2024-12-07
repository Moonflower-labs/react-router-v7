import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSubmit, useLoaderData, useLocation, Form } from "react-router";
import { BsFilterCircle } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import type { Category } from "@prisma/client";
import { MultiSelect } from "../shared/multi-select";
import { AnimatePresence, motion } from "framer-motion";

export const FilterComponent = React.memo(() => {
  const { q, categories } = (useLoaderData() as { q: string | null; categories: Category[] }) || { q: null };
  const formRef = useRef<HTMLFormElement | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const submit = useSubmit();

  const searchParams = new URLSearchParams(location.search);
  const isChecked = searchParams.get("favorites") === "true";

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const debounceSearchSubmit = useCallback((event: HTMLFormElement, options?: object) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const isFirstSearch = q == null;
      submit(event, { ...options, preventScrollReset: true, replace: isFirstSearch });
    }, 600);
  }, []);

  const handleOptionsChange = useCallback(() => {
    debounceSearchSubmit(formRef.current!);
  }, []);

  useEffect(() => {
    (document.getElementById("search") as HTMLInputElement).value = q || "";
  }, [q]);

  console.log("Filter component rendered!!");

  const handleReset = useCallback(() => {
    if (formRef.current) {
      formRef.current.reset();
      setSelectedOptions([]);
    }
    // Reset the URL search parameters
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("favorites");
    newSearchParams.delete("categories");
    newSearchParams.delete("search");
    submit(newSearchParams, { preventScrollReset: true });
  }, [location.search, submit]);

  return (
    <Form ref={formRef} onChange={e => debounceSearchSubmit(e.currentTarget)} onReset={handleReset}>
      <div className="flex flex-col md:flex-row justify-between gap-4 align-middle w-[90%] mx-auto pb-4">
        <div className="flex flex-row gap-4 align-middle w-full">
          <label className="input input-bordered input-md w-full md:w-1/3 flex items-center align-middle gap-2">
            <input type="text" className="w-full" placeholder="Buscar" name="search" id="search" defaultValue={q || ""} />
            <FaSearch size={24} className="text-primary" />
          </label>
        </div>
        <div className="flex flex-row gap-4 align-middle md:justify-end w-full">
          <div className="relative my-auto">
            <div role="button" onClick={() => setDropdownOpen(!isDropdownOpen)} className={`h-fit flex justify-between items-center gap-4 m-1 text-primary`}>
              <span className={`text-3xl h-10 duration-500 overflow-hidden whitespace-nowrap ${isDropdownOpen ? "w-[15px]" : "w-[85px]"}`}>
                {isDropdownOpen ? "x" : "Filtros"}
              </span>
              <span>
                <BsFilterCircle size={24} />
              </span>
            </div>
            <AnimatePresence mode="wait">
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.4 } }}
                  className="absolute md:right-0 dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 border border-neutral-content">
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <span className="label-text">Favoritos</span>
                      <input type="checkbox" className="checkbox checkbox-primary" name="favorites" value={"true"} defaultChecked={isChecked} />
                    </label>
                  </div>
                  <MultiSelect
                    name={"categories"}
                    selectedOptions={selectedOptions}
                    setSelectedOptions={setSelectedOptions}
                    onOptionsChange={handleOptionsChange}
                    options={categories.map(category => category.name)}
                  />
                  <button
                    type="reset"
                    onClick={e => {
                      setDropdownOpen(false);
                      e.currentTarget?.form?.reset();
                    }}
                    className="btn btn-outline btn-primary btn-sm">
                    Reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Form>
  );
});
