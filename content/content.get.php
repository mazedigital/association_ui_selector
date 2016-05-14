<?php

require_once(TOOLKIT . '/class.jsonpage.php');

Class contentExtensionAssociation_ui_selectorGet extends JSONPage
{

    public function view()
    {
        $entry_id = General::sanitize($_GET['entry_id']);
        $field_ids = explode(',', General::sanitize($_GET['field_id']));

        $parent_section_id = EntryManager::fetchEntrySectionID($entry_id);

        if($parent_section_id) {
            $parent_section = SectionManager::fetch($parent_section_id);
            $parent_section_handle = $parent_section->get('handle');

            // Fetch entry
            $value = '';
            if(!empty($field_ids[0])) {
                $entry = EntryManager::fetch($entry_id);

                foreach ($field_ids as $field_id) {
                    $field_data = $entry[0]->getData($field_id);

                    if (!empty($field_data)) {
                        $field = FieldManager::fetch($field_id);

                        if ($field instanceof ExportableField && in_array(ExportableField::UNFORMATTED, $field->getExportModes())) {

                            // Get unformatted value
                            $value = $field->prepareExportValue($field_data, ExportableField::UNFORMATTED, $entry_id);

                        } elseif ($field instanceof ExportableField && in_array(ExportableField::VALUE, $field->getExportModes())) {

                            // Get formatted value
                            $value = $field->prepareExportValue($field_data, ExportableField::VALUE, $entry_id);
                        } else {

                            // Get value from parameter pool
                            $value = $field->getParameterPoolValue($field_data, $entry_id);
                        }
                    }
                }
            }

            // Set data
            $this->_Result['entry']['value'] = $value;
            $this->_Result['entry']['section'] = $parent_section_handle;
            $this->_Result['entry']['link'] = SYMPHONY_URL . '/publish/' . $parent_section_handle . '/edit/' . $entry_id . '/';
        }

        // Return results
        return $this->_Result;
    }
}
