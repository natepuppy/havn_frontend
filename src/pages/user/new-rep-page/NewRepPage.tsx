import { useCreateRep, useDocuments, useMarkets, useRecruiters } from "@/hooks";
import { can } from "@/lib/permissions";
import { useGlobalStore } from "@/stores";
import { US_STATES } from "@/lib/states";
import { formatPhone } from "@/utils";
import { Button, Card, Checkbox, DatePicker, Form, Input, Select, Typography } from "antd";
import type { Dayjs } from "dayjs";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const LEVELS = ["Rookie", "Veteran", "Pro"] as const;
const HOUSINGS = ["Single housing", "Married housing"] as const;

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  start_date: Dayjs;
  end_date?: Dayjs;
  shirt_size: string;
  drivers_license_number: string;
  market?: string;
  level: (typeof LEVELS)[number];
  housing: (typeof HOUSINGS)[number];
  recruited_by_id: number;
  notes?: string;
  document_ids: number[];
};

export function NewRepPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const documents = useDocuments();
  const markets = useMarkets();
  const recruiters = useRecruiters();
  const createRep = useCreateRep();
  const user = useGlobalStore((state) => state.user);
  const canViewAll = can(user?.permissions, "view_all_reps");
  const activeDocuments = (documents.data?.data ?? []).filter((document) => document.active);
  const presetDocumentIds = activeDocuments
    .filter((document) => document.send_by_default || document.required)
    .map((document) => document.id)
    .join(",");
  const requiredDocumentIds = activeDocuments
    .filter((document) => document.required)
    .map((document) => document.id)
    .join(",");

  useEffect(() => {
    if (!canViewAll && user?.id) form.setFieldValue("recruited_by_id", user.id);
  }, [canViewAll, form, user?.id]);

  useEffect(() => {
    if (!presetDocumentIds && !requiredDocumentIds) return;
    const preset = presetDocumentIds ? presetDocumentIds.split(",").map((id) => Number(id)) : [];
    const required = requiredDocumentIds ? requiredDocumentIds.split(",").map((id) => Number(id)) : [];
    const current = (form.getFieldValue("document_ids") as number[] | undefined) ?? [];
    if (!current.length) {
      form.setFieldValue("document_ids", [...new Set([...preset, ...required])]);
      return;
    }
    const missing = required.filter((id) => !current.includes(id));
    if (missing.length) form.setFieldValue("document_ids", [...current, ...missing]);
  }, [form, presetDocumentIds, requiredDocumentIds]);

  const handleSubmit = async (values: FormValues) => {
    const phone = formatPhone(values.phone);
    if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) {
      form.setFields([{ name: "phone", errors: ["Use a 10-digit phone number."] }]);
      return;
    }

    try {
      const result = await createRep.mutateAsync({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone,
        street: values.street?.trim(),
        city: values.city?.trim(),
        state: values.state,
        zip: values.zip?.trim(),
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date?.format("YYYY-MM-DD"),
        shirt_size: values.shirt_size,
        drivers_license_number: values.drivers_license_number.trim(),
        market: values.market,
        level: values.level,
        housing: values.housing,
        notes: values.notes?.trim(),
        recruited_by_id: values.recruited_by_id,
        document_ids: [
          ...new Set([
            ...values.document_ids,
            ...(requiredDocumentIds ? requiredDocumentIds.split(",").map((id) => Number(id)) : []),
          ]),
        ],
      });
      const created = result.data[0];
      toast.success(`Onboarding packet sent to ${created.full_name}.`);
      navigate(`/reps/${created.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>New rep</h1>
          <p>Enter the rep, who recruited them, and which documents to send.</p>
        </div>
      </div>
      <Card>
        <Form<FormValues> className="new-rep-form" form={form} layout="vertical" onFinish={(values) => void handleSubmit(values)}>
          <Typography.Title level={4}>Rep</Typography.Title>
          <div className="new-rep-fields">
            <Form.Item label="First name" name="first_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Last name" name="last_name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Enter a valid email." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
              <Input placeholder="(801) 555-0100" />
            </Form.Item>
            <Form.Item label="Street" name="street">
              <Input />
            </Form.Item>
            <Form.Item label="City" name="city">
              <Input />
            </Form.Item>
            <Form.Item label="State" name="state">
              <Select
                showSearch
                optionFilterProp="label"
                options={US_STATES.map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>
            <Form.Item label="ZIP" name="zip" rules={[{ pattern: /^\d{5}$/, message: "Use 5 digits." }]}>
              <Input maxLength={5} />
            </Form.Item>
            <Form.Item label="Start date" name="start_date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="End date"
              name="end_date"
              dependencies={["start_date"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_rule, value: Dayjs | undefined) {
                    const start = getFieldValue("start_date") as Dayjs | undefined;
                    if (!value || !start || !value.isBefore(start, "day")) return Promise.resolve();
                    return Promise.reject(new Error("End date must be on or after the start date."));
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Shirt size" name="shirt_size" rules={[{ required: true, message: "Choose a shirt size." }]}>
              <Select options={SHIRT_SIZES.map((size) => ({ value: size, label: size }))} />
            </Form.Item>
            <Form.Item
              label="Driver's license number"
              name="drivers_license_number"
              rules={[{ required: true, message: "Enter the driver's license number." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Market" name="market">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={markets.isLoading}
                placeholder="Select a market"
                options={(markets.data?.data ?? []).map((market) => ({
                  value: market.name,
                  label: market.name,
                }))}
              />
            </Form.Item>
            <Form.Item label="Level" name="level" rules={[{ required: true, message: "Choose a level." }]}>
              <Select options={LEVELS.map((level) => ({ value: level, label: level }))} />
            </Form.Item>
            <Form.Item label="Housing" name="housing" rules={[{ required: true, message: "Choose a housing type." }]}>
              <Select options={HOUSINGS.map((housing) => ({ value: housing, label: housing }))} />
            </Form.Item>
          </div>

          <Typography.Title level={4}>Recruiter</Typography.Title>
          <Form.Item
            label="Who recruited them?"
            name="recruited_by_id"
            rules={[{ required: true, message: "Choose the recruiter." }]}
          >
            <Select
              disabled={!canViewAll}
              loading={recruiters.isLoading}
              placeholder="Select a recruiter"
              options={(canViewAll
                ? (recruiters.data?.data ?? [])
                : (recruiters.data?.data ?? []).filter((recruiter) => recruiter.id === user?.id)
              ).map((recruiter) => ({
                value: recruiter.id,
                label: `${recruiter.full_name} · ${recruiter.role}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} placeholder="License status, route, or anything the office should know." />
          </Form.Item>

          <Typography.Title level={4}>Documents</Typography.Title>
          <Typography.Paragraph type="secondary">
            Required documents stay selected. Default documents start selected and can be removed.
          </Typography.Paragraph>
          <Form.Item
            name="document_ids"
            rules={[{ required: true, message: "Choose at least one document." }]}
          >
            <Checkbox.Group
              style={{ display: "grid", gap: 4 }}
              options={activeDocuments.map((document) => ({
                label: document.required
                  ? `${document.name} (required)`
                  : document.description
                    ? `${document.name} — ${document.description}`
                    : document.name,
                value: document.id,
                disabled: document.required,
              }))}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={createRep.isPending}>
            Create rep and send docs
          </Button>
        </Form>
      </Card>
    </div>
  );
}
