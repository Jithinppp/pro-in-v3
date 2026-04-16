"use client";

import { useState, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EditDrawer } from "@/components/ui/EditDrawer";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Boxes, Edit2, Info, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

const subcategorySchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters").max(10),
  name: z.string().min(1, "Name is required"),
});

type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

export default function SubcategoriesPage() {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingSub, setEditingSub] = useState<any | null>(null);

  // Instant selection state (No URL dependency)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const createForm = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
  });

  const editForm = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
  });

  // Load Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    };
    fetchCategories();
  }, []);

  // Load Subcategories when categoryId changes (INSTANT)
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId) {
        setSubcategories([]);
        return;
      }
      const { data } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategoryId)
        .order("name");
      setSubcategories(data || []);
    };
    fetchSubcategories();
  }, [selectedCategoryId]);

  useEffect(() => {
    if (editingSub) {
      editForm.reset({
        code: editingSub.code,
        name: editingSub.name,
      });
    }
  }, [editingSub, editForm]);

  const onCreate = async (values: SubcategoryFormValues) => {
    if (!selectedCategoryId) return;
    startTransition(async () => {
      const { error } = await supabase.from("subcategories").insert([
        {
          category_id: selectedCategoryId,
          code: values.code.toUpperCase().trim(),
          name: values.name.trim(),
        },
      ]);

      if (error) {
        toast.error("Could not create subcategory. Code might already exist.");
      } else {
        createForm.reset();
        toast.success("Subcategory linked");
        // Refresh local list
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategoryId)
          .order("name");
        setSubcategories(data || []);
      }
    });
  };

  const onUpdate = async (values: SubcategoryFormValues) => {
    if (!editingSub) return;
    startTransition(async () => {
      const { error } = await supabase
        .from("subcategories")
        .update({
          code: values.code.toUpperCase().trim(),
          name: values.name.trim(),
        })
        .eq("id", editingSub.id);

      if (error) {
        toast.error("Update failed");
      } else {
        setEditingSub(null);
        toast.success("Subcategory updated");
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategoryId)
          .order("name");
        setSubcategories(data || []);
      }
    });
  };

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete subcategory "${name}"?`)) return;
    startTransition(async () => {
      const { count } = await supabase
        .from("models")
        .select("*", { count: "exact", head: true })
        .eq("subcategory_id", id);

      if (count && count > 0) {
        toast.error("Cannot delete subcategory if it has models assigned");
        return;
      }

      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Subcategory removed");
        const { data } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", selectedCategoryId)
          .order("name");
        setSubcategories(data || []);
      }
    });
  };

  return (
    <PageContainer>
      <div className="mb-12">
        <Link
          href="/inv/catalog"
          className="inline-flex items-center text-xs font-semibold text-mid-gray hover:text-charcoal uppercase tracking-widest transition-colors mb-4 group"
        >
          <ChevronLeft className="size-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>
        <PageHeader
          label="Catalog Portal"
          title="Subcategory Manager"
          subtitle="Organize system types within categories."
          className="!mb-0 !items-start !text-left"
        />
      </div>

      {/* Selector Section - INSTANT STATE */}
      <section className="p-6 bg-surface-warm border border-border-light rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text-primary">
            Parent Category
          </h3>
          <p className="text-xs text-text-tertiary">
            Select a category to manage its children.
          </p>
        </div>
        <div className="w-full md:w-72">
          <Select
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          />
        </div>
      </section>

      {selectedCategoryId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column: Register Form */}
          <section className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 text-mid-gray">
              <Plus className="size-4" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">New Subcategory</h2>
            </div>
            
            <form onSubmit={createForm.handleSubmit(onCreate)} className="p-8 bg-white rounded-lg border border-border space-y-6">
              <div className="space-y-4">
                <Input label="Subcategory Code" placeholder="e.g. MIC" {...createForm.register("code")} error={createForm.formState.errors.code?.message} className="uppercase" />
                <Input label="Subcategory Name" placeholder="e.g. Microphones" {...createForm.register("name")} error={createForm.formState.errors.name?.message} />
              </div>
              <Button isLoading={isPending} type="submit" className="w-full">Add Subcategory</Button>
            </form>
          </section>

          {/* Right Column: Existing List */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-mid-gray">
              <Boxes className="size-4" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Taxonomies</h2>
            </div>
            
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[10px] font-bold text-mid-gray uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold">CODE</th>
                      <th className="px-6 py-4 font-bold">NAME</th>
                      <th className="px-6 py-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {subcategories.map((sub) => (
                      <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                        <td className="px-6 py-5 font-display font-bold tracking-wider text-charcoal uppercase">{sub.code}</td>
                        <td className="px-6 py-5 font-semibold text-charcoal">{sub.name}</td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingSub(sub)} className="p-2 text-mid-gray hover:text-charcoal hover:bg-secondary rounded-md transition-all"><Edit2 className="size-4" /></button>
                            <button onClick={() => onDelete(sub.id, sub.name)} className="p-2 text-mid-gray hover:text-destructive hover:bg-destructive/5 rounded-md transition-all"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-surface-warm/20 border border-dashed border-border-light rounded-3xl">
          <Info className="w-10 h-10 text-text-tertiary opacity-30" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-secondary">
              Hierarchy Required
            </p>
            <p className="text-xs text-text-tertiary">
              Select a parent Category to manage sub-items.
            </p>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      <EditDrawer
        isOpen={!!editingSub}
        onClose={() => setEditingSub(null)}
        title="Edit Subcategory"
      >
        <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-6">
          <Input
            label="Subcategory Code"
            {...editForm.register("code")}
            error={editForm.formState.errors.code?.message}
            className="uppercase"
          />
          <Input
            label="Subcategory Name"
            {...editForm.register("name")}
            error={editForm.formState.errors.name?.message}
          />
          <div className="pt-4 space-y-3">
            <Button isLoading={isPending} type="submit" className="w-full">
              Save Changes
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="w-full"
              onClick={() => setEditingSub(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </EditDrawer>
    </PageContainer>
  );
}
