<?php

require_once(TOOLKIT . '/class.jsonpage.php');

Class contentExtensionAssociation_ui_selectorGet extends JSONPage
{
    
    public function view()
    {
        $database = Symphony::Configuration()->get('db', 'database');
        $field_id = General::sanitize($_GET['field_id']);
        $field_type = General::sanitize($_GET['field_type']);
        $search = General::sanitize($_GET['query']);

        if (!empty($search)) {

            // Get columns
            $columns = Symphony::Database()->fetchCol('column_name',
                sprintf(
                    "SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = '%s'
                    AND table_name = 'tbl_entries_data_%d'
                    AND column_name != 'id'
                    AND column_name != 'entry_id';", 
                    $database, 
                    $field_id
                )
            );

            // Build where clauses
            $where = array();
            foreach($columns as $column) {
                $where[] = "`$column` LIKE '%$search%'";
            }

            // Build query
            $query = sprintf(
                "SELECT * from sym_entries_data_%d WHERE %s LIMIT 100;",
                $field_id,
                implode($where, " OR ")
            );
        } else {
            $query = sprintf(
                "SELECT * from sym_entries_data_%d LIMIT 100;",
                $field_id
            );
        }

        // Query field data
        $data = Symphony::Database()->fetch($query);

        // Fetch field values
        $result = array();
        $field = FieldManager::fetch($field_id);
        foreach ($data as $field_data) {
            $entry_id = $field_data['entry_id'];

            if ($field instanceof ExportableField && in_array(ExportableField::UNFORMATTED, $field->getExportModes())) {

                // Get unformatted value
                $value = $field->prepareExportValue($field_data, ExportableField::UNFORMATTED, $entry_id);

            } else if ($field instanceof ExportableField && in_array(ExportableField::VALUE, $field->getExportModes())) {

                // Get formatted value
                $value = $field->prepareExportValue($field_data, ExportableField::VALUE, $entry_id);

            } else {

                // Get value from parameter pool
                $value = $field->getParameterPoolValue($field_data, $entry_id);

            }

            $result[$entry_id] = $value;
        }

        // Return results
        return $this->_Result = array(
            'request' => array(
                'field_id' => $field_id,
                'query' => $search
            ),
            'result' => $result
        );
    }
    
}
